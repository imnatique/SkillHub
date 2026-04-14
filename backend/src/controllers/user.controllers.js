import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Request } from "../models/request.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import { generateJWTToken_username } from "../utils/generateJWTToken.js";
import { uploadOnCloudinary } from "../config/connectCloudinary.js";
import { setAuthCookie } from "../utils/cookieOptions.js";

export const userDetailsWithoutID = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User details fetched successfully"));
});

export const UserDetails = asyncHandler(async (req, res) => {
  const username = req.params.username;

  const user = await User.findOne({ username });
  if (!user) throw new ApiError(404, "User not found");

  const request = await Request.find({
    $or: [
      { sender: req.user._id, receiver: user._id },
      { sender: user._id, receiver: req.user._id },
    ],
  });

  const status = request.length > 0 ? request[0].status : "Connect";

  return res
    .status(200)
    .json(new ApiResponse(200, { ...user._doc, status }, "User details fetched successfully"));
});

export const UnRegisteredUserDetails = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User details fetched successfully"));
});

// ── Shared validators ────────────────────────────────────────────────────────

const GITHUB_REGEX   = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
const LINKEDIN_REGEX = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
const EMAIL_REGEX    = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
const URL_REGEX      = /^(http|https):\/\/[^ "]+$/;

const validateLinks = ({ githubLink, linkedinLink, portfolioLink }) => {
  if (!githubLink && !linkedinLink && !portfolioLink)
    throw new ApiError(400, "Please provide atleast one link");
  if (linkedinLink && !linkedinLink.match(LINKEDIN_REGEX))
    throw new ApiError(400, "Please provide valid github and linkedin links");
  if (githubLink && !githubLink.match(GITHUB_REGEX))
    throw new ApiError(400, "Please provide valid github and linkedin links");
};

const validateEducation = (education) => {
  if (education.length === 0) throw new ApiError(400, "Education is required");
  education.forEach((edu) => {
    if (!edu.institution || !edu.degree)
      throw new ApiError(400, "Please provide all the details");
    if (!edu.startDate || !edu.endDate || !edu.score ||
        edu.score < 0 || edu.score > 100 || edu.startDate > edu.endDate)
      throw new ApiError(400, "Please provide valid score and dates");
  });
};

const validateProjects = (projects) => {
  projects.forEach((project) => {
    if (!project.title || !project.description || !project.projectLink ||
        !project.startDate || !project.endDate)
      throw new ApiError(400, "Please provide all the details");
    if (!project.projectLink.match(URL_REGEX))
      throw new ApiError(400, "Please provide valid project link");
    if (project.startDate > project.endDate)
      throw new ApiError(400, "Please provide valid dates");
  });
};

const validateBio = (bio) => {
  if (!bio) throw new ApiError(400, "Bio is required");
  if (bio.length > 500) throw new ApiError(400, "Bio should be less than 500 characters");
};

// ── UnRegistered user handlers ───────────────────────────────────────────────

export const saveRegUnRegisteredUser = asyncHandler(async (req, res) => {
  const { name, email, username, linkedinLink, githubLink, portfolioLink,
          skillsProficientAt, skillsToLearn } = req.body;

  if (!name || !email || !username || !skillsProficientAt.length || !skillsToLearn.length)
    throw new ApiError(400, "Please provide all the details");
  if (!email.match(EMAIL_REGEX))
    throw new ApiError(400, "Please provide valid email");
  if (username.length < 3)
    throw new ApiError(400, "Username should be atleast 3 characters long");

  validateLinks({ githubLink, linkedinLink, portfolioLink });

  if (await User.findOne({ username }))
    throw new ApiError(400, "Username already exists");

  const user = await UnRegisteredUser.findOneAndUpdate(
    { email },
    { name, username, linkedinLink, githubLink, portfolioLink, skillsProficientAt, skillsToLearn }
  );
  if (!user) throw new ApiError(500, "Error in saving user details");

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

export const saveEduUnRegisteredUser = asyncHandler(async (req, res) => {
  const { education, email } = req.body;
  validateEducation(education);

  const user = await UnRegisteredUser.findOneAndUpdate({ email }, { education });
  if (!user) throw new ApiError(500, "Error in saving user details");

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

export const saveAddUnRegisteredUser = asyncHandler(async (req, res) => {
  const { bio, projects, email } = req.body;
  validateBio(bio);
  if (projects.length > 0) validateProjects(projects);

  const user = await UnRegisteredUser.findOneAndUpdate({ email }, { bio, projects });
  if (!user) throw new ApiError(500, "Error in saving user details");

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

// ── Register ─────────────────────────────────────────────────────────────────

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, username, linkedinLink, githubLink, portfolioLink,
          skillsProficientAt, skillsToLearn, education, bio, projects } = req.body;

  if (!name || !email || !username || !skillsProficientAt.length || !skillsToLearn.length)
    throw new ApiError(400, "Please provide all the details");
  if (!email.match(EMAIL_REGEX))
    throw new ApiError(400, "Please provide valid email");
  if (username.length < 3)
    throw new ApiError(400, "Username should be atleast 3 characters long");

  validateLinks({ githubLink, linkedinLink, portfolioLink });
  validateEducation(education);
  validateBio(bio);
  if (projects.length > 0) validateProjects(projects);

  if (await User.findOne({ email }))  throw new ApiError(400, "User Already registered");
  if (await User.findOne({ username })) throw new ApiError(400, "Username already exists");

  const newUser = await User.create({
    name, email, username, linkedinLink, githubLink, portfolioLink,
    skillsProficientAt, skillsToLearn, education, bio, projects,
    picture: req.user.picture,
  });
  if (!newUser) throw new ApiError(500, "Error in saving user details");

  await UnRegisteredUser.findOneAndDelete({ email });

  setAuthCookie(res, "accessToken", generateJWTToken_username(newUser));
  res.clearCookie("accessTokenRegistration");

  return res.status(200).json(new ApiResponse(200, newUser, "NewUser registered successfully"));
});

// ── Registered user handlers ─────────────────────────────────────────────────

export const saveRegRegisteredUser = asyncHandler(async (req, res) => {
  const { name, username, linkedinLink, githubLink, portfolioLink,
          skillsProficientAt, skillsToLearn, picture } = req.body;

  if (!name || !username || !skillsProficientAt.length || !skillsToLearn.length)
    throw new ApiError(400, "Please provide all the details");
  if (username.length < 3)
    throw new ApiError(400, "Username should be atleast 3 characters long");

  validateLinks({ githubLink, linkedinLink, portfolioLink });

  const user = await User.findOneAndUpdate(
    { username: req.user.username },
    { name, username, linkedinLink, githubLink, portfolioLink, skillsProficientAt, skillsToLearn, picture }
  );
  if (!user) throw new ApiError(500, "Error in saving user details");

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

export const saveEduRegisteredUser = asyncHandler(async (req, res) => {
  const { education } = req.body;
  validateEducation(education);

  const user = await User.findOneAndUpdate({ username: req.user.username }, { education });
  if (!user) throw new ApiError(500, "Error in saving user details");

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

export const saveAddRegisteredUser = asyncHandler(async (req, res) => {
  const { bio, projects } = req.body;
  validateBio(bio);
  if (projects.length > 0) validateProjects(projects);

  const user = await User.findOneAndUpdate(
    { username: req.user.username },
    { bio, projects }
  );
  if (!user) throw new ApiError(500, "Error in saving user details");

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

// ── Misc ─────────────────────────────────────────────────────────────────────

export const uploadPic = asyncHandler(async (req, res) => {
  const LocalPath = req.files?.picture[0]?.path;
  if (!LocalPath) throw new ApiError(400, "Avatar file is required");

  const picture = await uploadOnCloudinary(LocalPath);
  if (!picture) throw new ApiError(500, "Error uploading picture");

  return res.status(200).json(new ApiResponse(200, { url: picture.url }, "Picture uploaded successfully"));
});

export const discoverUsers = asyncHandler(async (req, res) => {
  const webDevSkills = ["HTML", "CSS", "JavaScript", "React", "Angular", "Vue",
                        "Node.js", "Express", "MongoDB", "SQL", "NoSQL"];
  const machineLearningSkills = ["Python", "Natural Language Processing",
                                  "Deep Learning", "PyTorch", "Machine Learning"];

  const users = await User.find({ username: { $ne: req.user.username } });
  if (!users) throw new ApiError(500, "Error in fetching users");

  const usersToLearn = [], webDevUsers = [], mlUsers = [], otherUsers = [];

  users.sort(() => Math.random() - 0.5).forEach((user) => {
    if (user.skillsProficientAt.some((s) => req.user.skillsToLearn.includes(s)) && usersToLearn.length < 5)
      usersToLearn.push(user);
    else if (user.skillsProficientAt.some((s) => webDevSkills.includes(s)) && webDevUsers.length < 5)
      webDevUsers.push(user);
    else if (user.skillsProficientAt.some((s) => machineLearningSkills.includes(s)) && mlUsers.length < 5)
      mlUsers.push(user);
    else if (otherUsers.length < 5)
      otherUsers.push(user);
  });

  return res.status(200).json(
    new ApiResponse(200, { forYou: usersToLearn, webDev: webDevUsers, ml: mlUsers, others: otherUsers },
    "Users fetched successfully")
  );
});