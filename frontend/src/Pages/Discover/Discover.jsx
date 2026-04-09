import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../util/api.js";
import { toast } from "react-toastify";
import { useUser } from "../../util/UserContext";
import ProfileCard from "./ProfileCard";

const Discover = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [webDevUsers, setWebDevUsers] = useState([]);
  const [mlUsers, setMlUsers] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/user/registered/getDetails`);
        setUser(data.data);
        localStorage.setItem("userInfo", JSON.stringify(data.data));
      } catch (error) {
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        }
        localStorage.removeItem("userInfo");
        setUser(null);
        await api.get("/auth/logout");
        navigate("/login");
      }
    };

    const getDiscoverUsers = async () => {
      try {
        const { data } = await api.get("/user/discover");
        setDiscoverUsers(data.data.forYou);
        setWebDevUsers(data.data.webDev);
        setMlUsers(data.data.ml);
        setOtherUsers(data.data.others);
      } catch (error) {
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        }
        localStorage.removeItem("userInfo");
        setUser(null);
        await api.get("/auth/logout");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
    getDiscoverUsers();
  }, []);

  const renderSection = (id, title, users) => (
    <div>
      <h2 id={id} className="text-2xl font-bold text-txt my-6 font-josefin">
        {title}
      </h2>
      <div className="flex justify-center flex-wrap gap-4">
        {users && users.length > 0 ? (
          users.map((user, index) => (
            <ProfileCard
              key={index}
              profileImageUrl={user?.picture}
              name={user?.name}
              rating={user?.rating || 4}
              bio={user?.bio}
              skills={user?.skillsProficientAt}
              username={user?.username}
            />
          ))
        ) : (
          <p className="text-rd">No users to show</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-txt">
      <div className="w-full  p-6">
        {loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="w-12 h-12 border-4 border-tl border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <h1
              id="for-you"
              className="text-3xl font-bold text-tl mb-2 font-josefin"
            >
              For You
            </h1>
            <div className="flex justify-center flex-wrap gap-4 py-10 border-b border-brd">
              {discoverUsers && discoverUsers.length > 0 ? (
                discoverUsers.map((user, index) => (
                  <ProfileCard
                    key={index}
                    profileImageUrl={user?.picture}
                    name={user?.name}
                    rating={user?.rating || 5}
                    bio={user?.bio}
                    skills={user?.skillsProficientAt}
                    username={user?.username}
                  />
                ))
              ) : (
                <p className="text-rd">No users to show</p>
              )}
            </div>

            <h1
              id="popular"
              className="text-3xl font-bold text-tl mt-10 mb-6 font-josefin"
            >
              Popular
            </h1>
            {renderSection("web-development", "Web Development", webDevUsers)}
            {renderSection("machine-learning", "Machine Learning", mlUsers)}
            {renderSection("others", "Others", otherUsers)}
          </>
        )}
      </div>
    </div>
  );
};

export default Discover;
