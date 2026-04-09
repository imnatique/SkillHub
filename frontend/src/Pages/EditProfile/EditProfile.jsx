import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { skills } from "./Skills";
import api from "../../util/api.js";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../util/UserContext";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const { user, setUser } = useUser();

  const [form, setForm] = useState({
    profilePhoto: null,
    name: "",
    email: "",
    username: "",
    portfolioLink: "",
    githubLink: "",
    linkedinLink: "",
    skillsProficientAt: [],
    skillsToLearn: [],
    education: [
      {
        id: uuidv4(),
        institution: "",
        degree: "",
        startDate: "",
        endDate: "",
        score: "",
        description: "",
      },
    ],
    bio: "",
    projects: [],
  });
  const [skillsProficientAt, setSkillsProficientAt] =
    useState("Select some skill");
  const [skillsToLearn, setSkillsToLearn] = useState("Select some skill");
  const [techStack, setTechStack] = useState([]);
  const [activeKey, setActiveKey] = useState("registration");

  useEffect(() => {
    if (user) {
      setForm((prevState) => ({
        ...prevState,
        name: user?.name,
        email: user?.email,
        username: user?.username,
        skillsProficientAt: user?.skillsProficientAt,
        skillsToLearn: user?.skillsToLearn,
        portfolioLink: user?.portfolioLink,
        githubLink: user?.githubLink,
        linkedinLink: user?.linkedinLink,
        education: user?.education,
        bio: user?.bio,
        projects: user?.projects,
      }));
      setTechStack(user?.projects.map((project) => "Select some Tech Stack"));
    }
  }, []);

  const handleNext = () => {
    const tabs = ["registration", "education", "longer-tab"];
    const currentIndex = tabs.indexOf(activeKey);
    if (currentIndex < tabs.length - 1) {
      setActiveKey(tabs[currentIndex + 1]);
    }
  };

  const handleFileChange = async (e) => {
    const data = new FormData();
    data.append("picture", e.target.files[0]);
    try {
      toast.info("Uploading your pic please wait upload confirmation..");
      const response = await api.post("/user/uploadPicture", data);
      toast.success("Pic uploaded successfully");
      setForm(() => {
        return {
          ...form,
          picture: response.data.data.url,
        };
      });
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        if (error.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await api.get("/auth/logout");
          navigate("/login");
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prevState) => ({
        ...prevState,
        [name]: checked
          ? [...prevState[name], value]
          : prevState[name].filter((item) => item !== value),
      }));
    } else {
      if (name === "bio" && value.length > 500) {
        toast.error("Bio should be less than 500 characters");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleAddSkill = (e) => {
    const { name } = e.target;
    if (name === "skill_to_learn") {
      if (skillsToLearn === "Select some skill") {
        toast.error("Select a skill to add");
        return;
      }
      if (form.skillsToLearn.includes(skillsToLearn)) {
        toast.error("Skill already added");
        return;
      }
      if (form.skillsProficientAt.includes(skillsToLearn)) {
        toast.error("Skill already added in skills proficient at");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        skillsToLearn: [...prevState.skillsToLearn, skillsToLearn],
      }));
    } else {
      if (skillsProficientAt === "Select some skill") {
        toast.error("Select a skill to add");
        return;
      }
      if (form.skillsProficientAt.includes(skillsProficientAt)) {
        toast.error("Skill already added");
        return;
      }
      if (form.skillsToLearn.includes(skillsProficientAt)) {
        toast.error("Skill already added in skills to learn");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        skillsProficientAt: [
          ...prevState.skillsProficientAt,
          skillsProficientAt,
        ],
      }));
    }
  };

  const handleRemoveSkill = (e, temp) => {
    const skill = e.target.innerText.split(" ")[0];
    if (temp === "skills_proficient_at") {
      setForm((prevState) => ({
        ...prevState,
        skillsProficientAt: prevState.skillsProficientAt.filter(
          (item) => item !== skill
        ),
      }));
    } else {
      setForm((prevState) => ({
        ...prevState,
        skillsToLearn: prevState.skillsToLearn.filter((item) => item !== skill),
      }));
    }
  };

  const handleRemoveEducation = (e, tid) => {
    const updatedEducation = form.education.filter(
      (item, i) => item._id !== tid
    );
    setForm((prevState) => ({
      ...prevState,
      education: updatedEducation,
    }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      education: prevState.education.map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      ),
    }));
  };

  const handleAdditionalChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      projects: prevState.projects.map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      ),
    }));
  };

  const validateRegForm = () => {
    if (!form.username) {
      toast.error("Username is empty");
      return false;
    }
    if (!form.skillsProficientAt.length) {
      toast.error("Enter atleast one Skill you are proficient at");
      return false;
    }
    if (!form.skillsToLearn.length) {
      toast.error("Enter atleast one Skill you want to learn");
      return false;
    }
    if (!form.portfolioLink && !form.githubLink && !form.linkedinLink) {
      toast.error(
        "Enter atleast one link among portfolio, github and linkedin"
      );
      return false;
    }
    const githubRegex =
      /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.githubLink && githubRegex.test(form.githubLink) === false) {
      toast.error("Enter a valid github link");
      return false;
    }
    const linkedinRegex =
      /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.linkedinLink && linkedinRegex.test(form.linkedinLink) === false) {
      toast.error("Enter a valid linkedin link");
      return false;
    }
    if (form.portfolioLink && form.portfolioLink.includes("http") === false) {
      toast.error("Enter a valid portfolio link");
      return false;
    }
    return true;
  };

  const validateEduForm = () => {
    form.education.forEach((edu, index) => {
      if (!edu.institution) {
        toast.error(
          `Institution name is empty in education field ${index + 1}`
        );
        return false;
      }
      if (!edu.degree) {
        toast.error("Degree is empty");
        return false;
      }
      if (!edu.startDate) {
        toast.error("Start date is empty");
        return false;
      }
      if (!edu.endDate) {
        toast.error("End date is empty");
        return false;
      }
      if (!edu.score) {
        toast.error("Score is empty");
        return false;
      }
    });
    return true;
  };

  const validateAddForm = () => {
    if (!form.bio) {
      toast.error("Bio is empty");
      return false;
    }
    if (form.bio.length > 500) {
      toast.error("Bio should be less than 500 characters");
      return false;
    }
    var flag = true;
    form.projects.forEach((project, index) => {
      if (!project.title) {
        toast.error(`Title is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.techStack.length) {
        toast.error(`Tech Stack is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.startDate) {
        toast.error(`Start Date is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.endDate) {
        toast.error(`End Date is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.projectLink) {
        toast.error(`Project Link is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.description) {
        toast.error(`Description is empty in project ${index + 1}`);
        flag = false;
      }
      if (project.startDate > project.endDate) {
        toast.error(
          `Start Date should be less than End Date in project ${index + 1}`
        );
        flag = false;
      }
      if (!project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
        toast.error(
          `Please provide valid project link in project ${index + 1}`
        );
        flag = false;
      }
    });
    return flag;
  };

  const handleSaveRegistration = async () => {
    const check = validateRegForm();
    if (check) {
      setSaveLoading(true);
      try {
        const { data } = await api.post(
          "/user/registered/saveRegDetails",
          form
        );
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveEducation = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    if (check1 && check2) {
      setSaveLoading(true);
      try {
        const { data } = await api.post(
          "/user/registered/saveEduDetail",
          form
        );
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveAdditional = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = await validateAddForm();
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        const { data } = await api.post(
          "/user/registered/saveAddDetail",
          form
        );
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="m-4 font-oswald text-tl">Update Profile Details</h1>
      {loading ? (
        <div className="flex items-center justify-center h-[80.8vh] w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tl"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto border border-brd rounded-lg shadow-md p-6">
          <div className="flex border-b border-brd space-x-2 mb-4">
            <button
              className={`px-4 py-2 font-medium rounded-t-lg ${
                activeKey === "registration"
                  ? "bg-txt text-bgd"
                  : "bg-bgd text-txt hover:bg-hvr"
              }`}
              onClick={() => setActiveKey("registration")}
            >
              Registration
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-t-lg ${
                activeKey === "education"
                  ? "bg-txt text-bgd"
                  : "bg-bgd text-txt hover:bg-hvr"
              }`}
              onClick={() => setActiveKey("education")}
            >
              Education
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-t-lg ${
                activeKey === "longer-tab"
                  ? "bg-txt text-bgd"
                  : "bg-bgd text-txt hover:bg-hvr"
              }`}
              onClick={() => setActiveKey("longer-tab")}
            >
              Additional
            </button>
          </div>

          {activeKey === "registration" && (
            <div className="space-y-4">
              <div>
                <label className="text-tl">Name</label>
                <input
                  type="text"
                  name="username"
                  onChange={handleInputChange}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  value={form.name}
                  disabled
                />
              </div>

              <div>
                <label className="text-tl">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-txt bg-hvr py-1 border border-bgd"
                />
              </div>

              <div>
                <label className="text-tl">Email</label>
                <input
                  type="text"
                  name="username"
                  onChange={handleInputChange}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  value={form.email}
                  disabled
                />
              </div>

              <div>
                <label className="text-tl">Username</label>
                <input
                  type="text"
                  name="username"
                  onChange={handleInputChange}
                  value={form.username}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="text-tl">Linkedin Link</label>
                <input
                  type="text"
                  name="linkedinLink"
                  value={form.linkedinLink}
                  onChange={handleInputChange}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  placeholder="Enter your Linkedin link"
                />
              </div>

              <div>
                <label className="text-tl">Github Link</label>
                <input
                  type="text"
                  name="githubLink"
                  value={form.githubLink}
                  onChange={handleInputChange}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  placeholder="Enter your Github link"
                />
              </div>

              <div>
                <label className="text-tl">Portfolio Link</label>
                <input
                  type="text"
                  name="portfolioLink"
                  value={form.portfolioLink}
                  onChange={handleInputChange}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  placeholder="Enter your portfolio link"
                />
              </div>

              <div>
                <label className="text-tl">Skills Proficient At</label>
                <select
                  value={skillsProficientAt}
                  onChange={(e) => setSkillsProficientAt(e.target.value)}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                >
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
                {form?.skillsProficientAt?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.skillsProficientAt.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-bgd text-txt px-3 py-1 rounded-full text-sm flex items-center shadow-sm cursor-pointer hover:bg-hvr"
                        onClick={(event) =>
                          handleRemoveSkill(event, "skills_proficient_at")
                        }
                      >
                        {skill} &#10005;
                      </span>
                    ))}
                  </div>
                )}
                <button
                  className="mt-2 px-4 py-2 bg-tl text-txt font-medium rounded hover:bg-tlh"
                  name="skill_proficient_at"
                  onClick={handleAddSkill}
                >
                  Add Skill
                </button>
              </div>

              <div>
                <label className="text-tl">Skills To Learn</label>
                <select
                  value={skillsToLearn}
                  onChange={(e) => setSkillsToLearn(e.target.value)}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                >
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
                {form?.skillsToLearn?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.skillsToLearn.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-bgd text-txt px-3 py-1 rounded-full text-sm flex items-center shadow-sm cursor-pointer hover:bg-hvr"
                        onClick={(event) =>
                          handleRemoveSkill(event, "skills_to_learn")
                        }
                      >
                        {skill} &#10005;
                      </span>
                    ))}
                  </div>
                )}
                <button
                  className="mt-2 px-4 py-2 bg-tl text-txt font-medium rounded hover:bg-tlh"
                  name="skill_to_learn"
                  onClick={handleAddSkill}
                >
                  Add Skill
                </button>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  className="px-4 py-2 bg-gr text-txt font-medium rounded hover:bg-grs disabled:opacity-50"
                  onClick={handleSaveRegistration}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-tl mx-auto"></div>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-yellow-500 text-txt font-medium rounded hover:bg-yellow-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeKey === "education" && (
            <div className="space-y-4">
              {form?.education?.map((edu, index) => (
                <div
                  className="border border-brd rounded p-4 space-y-3"
                  key={edu?._id}
                >
                  {index !== 0 && (
                    <div className="flex justify-end">
                      <button
                        className="text-rd"
                        onClick={(e) => handleRemoveEducation(e, edu?._id)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div>
                    <label className="text-tl">Institution Name</label>
                    <input
                      type="text"
                      name="institution"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      placeholder="Enter your institution name"
                    />
                  </div>

                  <div>
                    <label className="text-tl">Degree</label>
                    <input
                      type="text"
                      name="degree"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      placeholder="Enter your degree"
                    />
                  </div>

                  <div>
                    <label className="text-tl">Grade/Percentage</label>
                    <input
                      type="number"
                      name="score"
                      value={edu.score}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      placeholder="Enter your grade/percentage"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-tl">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={
                          edu.startDate
                            ? new Date(edu.startDate)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) => handleEducationChange(e, index)}
                        className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-tl">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={
                          edu.endDate
                            ? new Date(edu.endDate).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => handleEducationChange(e, index)}
                        className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-tl">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={edu.description}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      placeholder="Enter your exp or achievements"
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-center">
                <button
                  className="px-4 py-2 bg-tl text-txt font-medium rounded hover:bg-tlh"
                  onClick={() => {
                    setForm((prevState) => ({
                      ...prevState,
                      education: [
                        ...prevState.education,
                        {
                          id: uuidv4(),
                          institution: "",
                          degree: "",
                          startDate: "",
                          endDate: "",
                          score: "",
                          description: "",
                        },
                      ],
                    }));
                  }}
                >
                  Add Education
                </button>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  className="px-4 py-2 bg-grs text-txt font-medium rounded hover:bg-grs disabled:opacity-50"
                  onClick={handleSaveEducation}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-tl mx-auto"></div>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-yellow-500 text-txt font-medium rounded hover:bg-yellow-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeKey === "longer-tab" && (
            <div className="space-y-4">
              <div>
                <label className="text-tl">Bio (Max 500 Character)</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  placeholder="Enter your bio"
                />
              </div>

              <div>
                <label className="text-tl">Projects</label>

                {form?.projects?.map((project, index) => (
                  <div
                    className="border border-brd rounded p-4 space-y-3 mb-4"
                    key={project?._id}
                  >
                    <div className="flex justify-end">
                      <button
                        className="text-rd"
                        onClick={() => {
                          setForm((prevState) => ({
                            ...prevState,
                            projects: prevState.projects.filter(
                              (item) => item?._id !== project?._id
                            ),
                          }));
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div>
                      <label className="text-tl">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={project.title}
                        onChange={(e) => handleAdditionalChange(e, index)}
                        className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                        placeholder="Enter your project title"
                      />
                    </div>

                    <div>
                      <label className="text-tl">Tech Stack</label>
                      <select
                        value={techStack[index]}
                        onChange={(e) => {
                          setTechStack((prevState) =>
                            prevState.map((item, i) =>
                              i === index ? e.target.value : item
                            )
                          );
                        }}
                        className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      >
                        <option>Select some Tech Stack</option>
                        {skills.map((skill, index) => (
                          <option key={index} value={skill}>
                            {skill}
                          </option>
                        ))}
                      </select>

                      {techStack[index].length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form?.projects[index]?.techStack.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-bgd text-txt px-3 py-1 rounded-full text-sm flex items-center cursor-pointer hover:bg-hvr"
                              onClick={(e) => {
                                setForm((prevState) => ({
                                  ...prevState,
                                  projects: prevState.projects.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          techStack: item.techStack.filter(
                                            (item) => item !== skill
                                          ),
                                        }
                                      : item
                                  ),
                                }));
                              }}
                            >
                              {skill} &#10005;
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        className="mt-2 px-4 py-2 bg-tl text-txt font-medium rounded hover:bg-tlh"
                        name="tech_stack"
                        onClick={(e) => {
                          if (techStack[index] === "Select some Tech Stack") {
                            toast.error("Select a tech stack to add");
                            return;
                          }
                          if (
                            form.projects[index].techStack.includes(
                              techStack[index]
                            )
                          ) {
                            toast.error("Tech Stack already added");
                            return;
                          }
                          setForm((prevState) => ({
                            ...prevState,
                            projects: prevState.projects.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    techStack: [
                                      ...item.techStack,
                                      techStack[index],
                                    ],
                                  }
                                : item
                            ),
                          }));
                        }}
                      >
                        Add Tech Stack
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-tl">Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={
                            project.startDate
                              ? new Date(project.startDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) => handleAdditionalChange(e, index)}
                          className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-tl">End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={
                            project.endDate
                              ? new Date(project.endDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) => handleAdditionalChange(e, index)}
                          className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-tl">Project Link</label>
                      <input
                        type="text"
                        name="projectLink"
                        value={project.projectLink}
                        onChange={(e) => handleAdditionalChange(e, index)}
                        className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                        placeholder="Enter your project link"
                      />
                    </div>

                    <div>
                      <label className="text-tl">Description</label>
                      <input
                        type="text"
                        name="description"
                        value={project.description}
                        onChange={(e) => handleAdditionalChange(e, index)}
                        className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                        placeholder="Enter your project description"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-center">
                  <button
                    className="px-4 py-2 bg-tl text-txt font-medium rounded hover:bg-tlh"
                    onClick={() => {
                      setTechStack((prevState) => {
                        return [...prevState, "Select some Tech Stack"];
                      });
                      setForm((prevState) => ({
                        ...prevState,
                        projects: [
                          ...prevState.projects,
                          {
                            id: uuidv4(),
                            title: "",
                            techStack: [],
                            startDate: "",
                            endDate: "",
                            projectLink: "",
                            description: "",
                          },
                        ],
                      }));
                    }}
                  >
                    Add Project
                  </button>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  className="px-4 py-2 bg-gr text-txt font-medium rounded hover:bg-grs disabled:opacity-50"
                  onClick={handleSaveAdditional}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-tl mx-auto"></div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditProfile;
