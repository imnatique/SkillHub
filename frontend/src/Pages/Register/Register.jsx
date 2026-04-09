import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../util/api.js";
import { skills } from "./Skills";
import { v4 as uuidv4 } from "uuid";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [form, setForm] = useState({
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
          (item) => item !== skill,
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
      (item, i) => item.id !== tid,
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
        i === index ? { ...item, [name]: value } : item,
      ),
    }));
  };

  const handleAdditionalChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      projects: prevState.projects.map((item, i) =>
        i === index ? { ...item, [name]: value } : item,
      ),
    }));
  };

  const handleNext = () => {
    const tabs = ["registration", "education", "longer-tab", "Preview"];
    const currentIndex = tabs.indexOf(activeKey);
    if (currentIndex < tabs.length - 1) {
      setActiveKey(tabs[currentIndex + 1]);
    }
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
        "Enter atleast one link among portfolio, github and linkedin",
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
    let valid = true;
    form.education.forEach((edu, index) => {
      if (!edu.institution) {
        toast.error(
          `Institution name is empty in education field ${index + 1}`,
        );
        valid = false;
      }
      if (!edu.degree) {
        toast.error("Degree is empty");
        valid = false;
      }
      if (!edu.startDate) {
        toast.error("Start date is empty");
        valid = false;
      }
      if (!edu.endDate) {
        toast.error("End date is empty");
        valid = false;
      }
      if (!edu.score) {
        toast.error("Score is empty");
        valid = false;
      }
    });
    return valid;
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
          `Start Date should be less than End Date in project ${index + 1}`,
        );
        flag = false;
      }
      if (!project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
        toast.error(
          `Please provide valid project link in project ${index + 1}`,
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
          "/user/unregistered/saveRegDetails",
          form,
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
          "/user/unregistered/saveEduDetail",
          form,
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
          "/user/unregistered/saveAddDetail",
          form,
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

  const handleSubmit = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = validateAddForm();
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        const { data } = await api.post("/user/registerUser", form);
        localStorage.setItem("userInfo", JSON.stringify(data.data));
        toast.success("Registration Successful");
        navigate("/discover");
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

  const TabButton = ({ title, tabKey }) => (
    <button
      onClick={() => setActiveKey(tabKey)}
      className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
        activeKey === tabKey
          ? "bg-txt text-bgd"
          : "bg-bgd text-txt hover:bg-hvr"
      }`}
    >
      {title}
    </button>
  );

  useEffect(() => {
    setLoading(true);
    const getUser = async () => {
      try {
        const { data } = await api.get("/user/unregistered/getDetails");
        const edu = data?.data?.education;
        edu.forEach((ele) => {
          ele.id = uuidv4();
        });
        if (edu.length === 0) {
          edu.push({
            id: uuidv4(),
            institution: "",
            degree: "",
            startDate: "",
            endDate: "",
            score: "",
            description: "",
          });
        }
        const proj = data?.data?.projects;
        if (proj) {
          proj.forEach((ele) => {
            ele.id = uuidv4();
          });
          setTechStack(proj.map((item) => "Select some Tech Stack"));
        }
        setForm((prevState) => ({
          ...prevState,
          name: data?.data?.name,
          email: data?.data?.email,
          username: data?.data?.username,
          skillsProficientAt: data?.data?.skillsProficientAt,
          skillsToLearn: data?.data?.skillsToLearn,
          linkedinLink: data?.data?.linkedinLink,
          githubLink: data?.data?.githubLink,
          portfolioLink: data?.data?.portfolioLink,
          education: edu,
          bio: data?.data?.bio,
          projects: proj ? proj : prevState.projects,
        }));
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          navigate("/login");
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center text-txt mb-8">
        Registration Form
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tl"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto border border-brd rounded-lg shadow-md p-6">
          <div className="flex space-x-2 mb-6">
            <TabButton title="Registration" tabKey="registration" />
            <TabButton title="Education" tabKey="education" />
            <TabButton title="Additional" tabKey="longer-tab" />
            <TabButton title="Confirm Details" tabKey="Preview" />
          </div>

          {activeKey === "registration" && (
            <div className="space-y-4">
              <div>
                <label className="block text-tl mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  onChange={handleInputChange}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  value={form.name}
                  disabled
                />
              </div>

              <div>
                <label className="block text-tl mb-1">Email</label>
                <input
                  type="text"
                  name="email"
                  onChange={handleInputChange}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  value={form.email}
                  disabled
                />
              </div>

              <div>
                <label className="block text-tl mb-1">Username</label>
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
                <label className="block text-tl mb-1">Linkedin Link</label>
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
                <label className="block text-tl mb-1">Github Link</label>
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
                <label className="block text-tl mb-1">Portfolio Link</label>
                <input
                  type="text"
                  name="portfolioLink"
                  value={form.portfolioLink}
                  onChange={handleInputChange}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  placeholder="Enter your Portfolio link"
                />
              </div>

              <div>
                <label className="block text-tl mb-1">
                  Skills Proficient At
                </label>
                <select
                  value={skillsProficientAt}
                  onChange={(e) => setSkillsProficientAt(e.target.value)}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                >
                  <option>Select Some Skill</option>
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
                        {/* {skill} <span className="ml-1 hover:text-rd">×</span> */}
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
                <label className="block text-tl mb-1 mt-4">
                  Skills To Learn
                </label>
                <select
                  value={skillsToLearn}
                  onChange={(e) => setSkillsToLearn(e.target.value)}
                  className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
                >
                  <option>Select Some Skill</option>
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
                        {/* {skill} <span className="ml-1 hover:text-rd"> × </span> */}
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

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  className="px-4 py-2 bg-gr text-txt font-medium rounded hover:bg-grs disabled:opacity-50"
                  onClick={handleSaveRegistration}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-tl"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-yellow-500 text-txt rounded hover:bg-yellow-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeKey === "education" && (
            <div className="space-y-4">
              {form.education.map((edu, index) => (
                <div className="rounded-lg p-4" key={edu.id}>
                  {index !== 0 && (
                    <div className="flex justify-end">
                      <button
                        className="text-rd hover:text-rds"
                        onClick={(e) => handleRemoveEducation(e, edu.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div>
                    <label className="block text-tl mb-1">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      placeholder="Enter your institution name"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-tl mb-1">Degree</label>
                    <input
                      type="text"
                      name="degree"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      placeholder="Enter your degree"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-tl mb-1">
                      Grade/Percentage
                    </label>
                    <input
                      type="number"
                      name="score"
                      value={edu.score}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      placeholder="Enter your grade/percentage"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-tl mb-1">Start Date</label>
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
                        className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-tl mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={
                          edu.endDate
                            ? new Date(edu.endDate).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => handleEducationChange(e, index)}
                        className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-tl mb-1">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={edu.description}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                      placeholder="Enter your exp or achievements"
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-center my-4">
                <button
                  className="px-4 py-2 bg-gr text-txt font-medium rounded hover:bg-grs"
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

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  className="px-4 py-2 bg-yellow-500 text-txt font-medium rounded hover:bg-yellow-600 disabled:opacity-50"
                  onClick={handleSaveEducation}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-tl"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-tl text-txt font-medium rounded hover:bg-tlh"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeKey === "longer-tab" && (
            <div className="space-y-4">
              <div>
                <label className="block text-tl mb-1">
                  Bio (Max 500 Character)
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                  placeholder="Enter your bio"
                  rows="4"
                ></textarea>
              </div>

              <div>
                <label className="block text-tl mb-1">Projects</label>

                {form.projects.map((project, index) => (
                  <div
                    className="border border-bgd rounded-lg p-4 mb-4"
                    key={project.id}
                  >
                    <div className="flex justify-end">
                      <button
                        className="text-rd hover:text-rds"
                        onClick={() => {
                          setForm((prevState) => ({
                            ...prevState,
                            projects: prevState.projects.filter(
                              (item) => item.id !== project.id,
                            ),
                          }));
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <label className="block text-tl mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={project.title}
                        onChange={(e) => handleAdditionalChange(e, index)}
                        className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                        placeholder="Enter your project title"
                      />
                    </div>
                    <div className="mt-2">
                      <label className="block text-tl mb-1">Tech Stack</label>
                      <select
                        className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                        value={techStack[index]}
                        onChange={(e) => {
                          setTechStack((prevState) =>
                            prevState.map((item, i) =>
                              i === index ? e.target.value : item,
                            ),
                          );
                        }}
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
                          {form.projects[index].techStack.map((skill, i) => (
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
                                            (item) => item !== skill,
                                          ),
                                        }
                                      : item,
                                  ),
                                }));
                              }}
                            >
                              {skill}{" "}
                              <span className="ml-1 hover:text-rd">×</span>
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
                              techStack[index],
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
                                : item,
                            ),
                          }));
                        }}
                      >
                        Add Tech Stack
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-tl mb-1">Start Date</label>
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
                        <label className="block text-tl mb-1">End Date</label>
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
                    <div className="mt-2">
                      <label className="block text-tl mb-1">Project Link</label>
                      <input
                        type="text"
                        name="projectLink"
                        value={project.projectLink}
                        onChange={(e) => handleAdditionalChange(e, index)}
                        className="w-full p-2 rounded bg-hvr border border-bgd text-txt focus:outline-none"
                        placeholder="Enter your project link"
                      />
                    </div>
                    <div className="mt-2">
                      <label className="block text-tl mb-1">Description</label>
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

                <div className="flex justify-center my-4">
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

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  className="px-4 py-2 bg-yellow-500 text-txt font-medium rounded hover:bg-yellow-600 disabled:opacity-50"
                  onClick={handleSaveAdditional}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-tl"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-gr text-txt font-medium rounded hover:bg-grs"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeKey === "Preview" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center text-tl">
                Preview of the Form
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <span className="font-bold text-tl w-full md:w-1/4">
                    Name:
                  </span>
                  <span className="bg-hvr py-2 text-txt w-full md:w-3/4">
                    {form.name || "Yet to be filled"}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <span className="font-bold text-tl w-full md:w-1/4">
                    Email ID:
                  </span>
                  <span className="bg-hvr py-2 text-txt w-full md:w-3/4">
                    {form.email || "Yet to be filled"}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <span className="font-bold text-tl w-full md:w-1/4">
                    Username:
                  </span>
                  <span className="bg-hvr py-2 text-txt w-full md:w-3/4">
                    {form.username || "Yet to be filled"}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <span className="font-bold text-tl w-full md:w-1/4">
                    Portfolio Link:
                  </span>
                  <span className="bg-hvr py-2 text-txt w-full md:w-3/4 break-words">
                    {form.portfolioLink || "Yet to be filled"}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <span className="font-bold text-tl w-full md:w-1/4">
                    Github Link:
                  </span>
                  <span className="bg-hvr py-2 text-txt w-full md:w-3/4 break-words">
                    {form.githubLink || "Yet to be filled"}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <span className="font-bold text-tl w-full md:w-1/4">
                    Linkedin Link:
                  </span>
                  <span className="bg-hvr py-2 text-txt w-full md:w-3/4 break-words">
                    {form.linkedinLink || "Yet to be filled"}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <span className="font-bold text-tl w-full md:w-1/4">
                    Skills Proficient At:
                  </span>
                  <span className="bg-hvr py-2 text-txt w-full md:w-3/4">
                    {form.skillsProficientAt.join(", ") || "Yet to be filled"}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <span className="font-bold text-tl w-full md:w-1/4">
                    Skills To Learn:
                  </span>
                  <span className="bg-hvr py-2 text-txt w-full md:w-3/4">
                    {form.skillsToLearn.join(", ") || "Yet to be filled"}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <span className="font-bold text-tl w-full md:w-1/4">
                    Bio:
                  </span>
                  <span className="bg-hvr py-2 text-txt w-full md:w-3/4">
                    {form.bio || "Yet to be filled"}
                  </span>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-gr text-txt font-medium rounded-lg hover:bg-grs disabled:opacity-50"
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="-spin -ml-1 mr-2 h-5 w-5 text-tl"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit"
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

export default Register;
