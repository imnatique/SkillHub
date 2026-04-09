import Box from "./Box";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { toast } from "react-toastify";
import api from "../../util/api.js";
import { Link } from "react-router-dom";
import { FaUserEdit, FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

const Profile = () => {
  const { user, setUser } = useUser();
  const [profileUser, setProfileUser] = useState(null);
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/user/registered/getDetails/${username}`
        );
        setProfileUser(data.data);
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
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const convertDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date
      .toLocaleDateString("en-US", { month: "2-digit", year: "numeric" })
      .replace("/", "-");
    return formattedDate;
  };

  const connectHandler = async () => {
    try {
      setConnectLoading(true);
      const { data } = await api.post(`/request/create`, {
        receiverID: profileUser._id,
      });

      toast.success(data.message);
      setProfileUser((prevState) => ({ ...prevState, status: "Pending" }));
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
    } finally {
      setConnectLoading(false);
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="max-w-6xl mx-auto min-h-[86vh]">
        {loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="w-12 h-12 border-4 border-tl border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row  border bg-bgd border-brd shadow rounded-lg p-6">
              <div className="flex flex-col md:flex-row w-full">
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <img
                    className="w-32 h-32 rounded-full object-cover"
                    src={profileUser?.picture}
                    alt="Profile"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-2xl font-semibold text-txt mb-2">
                    {profileUser?.name}
                  </h1>
                  <div className="flex items-center text-yellow-500 mb-2">
                    <span>
                      {profileUser?.rating
                        ? Array.from(
                            { length: profileUser.rating },
                            (_, index) => <span key={index}>⭐</span>
                          )
                        : "⭐⭐⭐⭐⭐"}
                    </span>
                    <span className="ml-2 text-sm text-txt">
                      {profileUser?.rating || "5"}
                    </span>
                  </div>
                  {user?.username !== username && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        className=" border border-brd hover:bg-tl text-txt font-medium px-4 py-2 rounded"
                        onClick={
                          profileUser?.status === "Connect"
                            ? connectHandler
                            : undefined
                        }
                      >
                        {connectLoading ? (
                          <div className="w-4 h-4 border-2 border-tl border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          profileUser?.status
                        )}
                      </button>
                      <Link to={`/report/${profileUser.username}`}>
                        <button className=" border border-brd bg-rd hover:bg-rds text-txt font-medium px-4 py-2 rounded">
                          Report
                        </button>
                      </Link>
                      <Link to={`/rating/${profileUser.username}`}>
                        <button className=" border border-brd bg-gr hover:bg-grs text-txt font-medium px-4 py-2 rounded">
                          Rate
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              {user.username === username && (
                <div className="mt-4 md:mt-6 md:mr-2 md:ml-auto">
                  <Link to="/edit_profile">
                    <button className="text-tl hover:scale-110 transition-all duration-200">
                      <span>
                        <FaUserEdit className="w-5 h-5" />
                      </span>
                    </button>
                  </Link>
                </div>
              )}
              <div className="flex space-x-4 mt-4 md:mt-6">
                <a
                  href={profileUser?.githubLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-txt hover:text-tl hover:scale-110 transition-all duration-200"
                >
                  <FaGithub />
                </a>
                <a
                  href={profileUser?.linkedinLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-txt hover:text-tl hover:scale-110 transition-all duration-200"
                >
                  <FaLinkedin />
                </a>
                <a
                  href={profileUser?.portfolioLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-txt hover:text-tl hover:scale-110 transition-all duration-200"
                >
                  <FaGlobe />
                </a>
              </div>
            </div>

            <div className="mt-8 border-b border-brd">
              <h2 className="text-xl text-tl font-bold mb-2">Bio</h2>
              <p className="text-txt">{profileUser?.bio}</p>
            </div>

            <div className="mt-8 border-b border-brd flex flex-col items-center space-y-2">
              <h2 className="text-xl text-tl font-bold mb-4">
                Skills Proficient At
              </h2>
              <div className="flex flex-wrap gap-2">
                {profileUser?.skillsProficientAt.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-hvr border border-bgd text-txt px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl text-tl font-bold mb-4">Education</h2>
              <div className="space-y-4">
                {profileUser?.education?.map((edu, index) => (
                  <Box
                    key={index}
                    head={edu?.institution}
                    date={
                      convertDate(edu?.startDate) +
                      " - " +
                      convertDate(edu?.endDate)
                    }
                    spec={edu?.degree}
                    desc={edu?.description}
                    score={edu?.score}
                  />
                ))}
              </div>
            </div>

            {profileUser?.projects?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl text-tl font-bold mb-4">Projects</h2>
                <div className="space-y-4">
                  {profileUser?.projects.map((project, index) => (
                    <Box
                      key={index}
                      head={project?.title}
                      date={
                        convertDate(project?.startDate) +
                        " - " +
                        convertDate(project?.endDate)
                      }
                      desc={project?.description}
                      skills={project?.techStack}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
