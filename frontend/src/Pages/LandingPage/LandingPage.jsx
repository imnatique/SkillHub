import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("userInfo");
  const handleNavigate = () => {
    navigate(isLoggedIn ? "/discover" : "/login");
  };

  return (
    <div className="flex flex-col items-center relative overflow-hidden">
      <section className="min-h-screen w-full bg-bgl py-16 px-6 md:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="md:w-1/2 md:pb-none pb-10">
            <h1 className="text-4xl md:text-6xl font-bold text-txt mb-6 leading-tight">
              Swap Skills with <br /> Skilled Individuals
            </h1>
            <p className="text-lg text-txt mb-6">
              Welcome to SkillHub – a community where you connect, collaborate,
              and exchange skills with others. Learn something new or teach what
              you know — no money involved!
            </p>
            <button
              onClick={handleNavigate}
              className="bg-rd text-bgl font-medium px-6 py-3 rounded hover:bg-rds transition"
            >
              {isLoggedIn ? "Explore Discover" : "Start Skill Swap"}
            </button>
          </div>

          <div className="md:w-1/2 flex flex-col items-center gap-6 relative">
            <div className="absolute top-10 right-5 w-[300px] h-[300px] md:w-[450px] md:h-[450px] border-2 border-dashed border-txt rounded-full opacity-20 z-0"></div>

            <div className="relative z-10 bg-bgl shadow-lg p-4 rounded-xl flex items-start gap-4 w-full max-w-xs">
              <img
                src="user1.jpg"
                alt="Nabil"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium">Nabil</p>
                  <div className="flex items-center text-yellow-500">
                    <FaStar className="text-sm" />
                    <span className="ml-1 text-sm">4.0</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Can teach C++, looking to learn MongoDB.
                </p>
              </div>
            </div>

            <div className="relative z-10 bg-tl p-5 rounded-xl shadow-md text-center w-full max-w-xs">
              <div className="relative inline-block mb-3">
                <div className="bg-yellow-400 p-3 rounded-full text-lg">🔔</div>
                <span className="absolute top-0 right-0 bg-rds text-white text-xs px-1.5 rounded-full">
                  2
                </span>
              </div>
              <h4 className="text-lg font-semibold text-txt mb-1">Reminder</h4>
              <p className="text-sm text-txt mb-3">
                Find a match to swap your skill today!
              </p>
              <button className="bg-yellow-400 text-txt px-4 py-1 rounded hover:bg-yellow-300 transition">
                Got it
              </button>
            </div>

            <div className="relative z-10 bg-white shadow-lg p-4 rounded-xl flex items-start gap-4 w-full max-w-xs">
              <img
                src="user2.jpg"
                alt="Liza"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium">Liza</p>
                  <div className="flex items-center text-yellow-500">
                    <FaStar className="text-sm" />
                    <span className="ml-1 text-sm">5.0</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  I can teach Graphic Design, looking for help with Python
                  basics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <h2 className="text-center text-txt font-oswald px-5 w-full text-[3rem] font-bold  border-b  border-brd">
        Why Skill Hub?
      </h2>

      <div className="text-center items-center min-h-[82vh]  mt-10">
        <div className=" text-txt text-xl max-w-[1000px] mx-auto p-6">
          <p className="mb-10">
            At Skill Hub, we believe in the power of mutual learning and
            collaboration. Here's why Skill Hub is the ultimate platform for
            skill acquisition and knowledge exchange:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left text-xl">
            <div>
              <h4 className="text-tl border-b border-brd font-semibold mb-2">
                Learn From Experts
              </h4>
              <p>
                Gain insights and practical knowledge directly from experienced
                mentors who excel in their fields.
              </p>
            </div>
            <div>
              <h4 className="text-tl border-b border-brd font-semibold mb-2">
                Share Your Expertise
              </h4>
              <p>
                Become a mentor, share your skills, and foster a thriving
                learning community.
              </p>
            </div>
            <div>
              <h4 className="text-tl border-b border-brd font-semibold mb-2">
                Collaborative Environment
              </h4>
              <p>
                Connect, collaborate, and innovate with like-minded learners on
                real projects.
              </p>
            </div>
            <div>
              <h4 className="text-tl border-b border-brd font-semibold mb-2">
                Diverse Learning Opportunities
              </h4>
              <p>
                Explore a wide range of free skills—from arts to advanced
                tech—based on your interests.
              </p>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-tl border-b border-brd font-semibold mb-2">
                Continuous Growth
              </h4>
              <p>
                Stay curious and keep learning at your own pace, whether you're
                a beginner or a pro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
