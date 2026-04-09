import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { FaChevronDown } from "react-icons/fa";
import api from "../../util/api.js";

const UserProfileDropdown = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    try {
      await api.get("/auth/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error(error.response?.data?.message || error);
    }
  };

  return (
    <div className="relative">
      <div
        className="flex items-center cursor-pointer "
        onClick={() => setOpen(!open)}
      >
        <img
          src={user?.picture}
          alt="User Avatar"
          className="w-8 h-8 rounded-full mr-2 object-cover"
        />
        <FaChevronDown className="w-4 h-4 text-txt inline-block transition-transform duration-200 hover:scale-110" />
      </div>

      {open && (
        <ul className="absolute right-0 mt-2 bg-bgd rounded shadow-md z-50 w-40">
          <li
            className="px-4 py-2 hover:bg-gr cursor-pointer"
            onClick={() => {
              navigate(`/profile/${user.username}`);
              setOpen(false);
            }}
          >
            Profile
          </li>
          <li
            className="px-4 py-2 hover:bg-rd cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </li>
        </ul>
      )}
    </div>
  );
};

const Header = () => {
  const [navUser, setNavUser] = useState(null);
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const discover = location.pathname === "/discover";

  useEffect(() => {
    setNavUser(JSON.parse(localStorage.getItem("userInfo")));
  }, [user]);

  return (
    <nav className="bg-transparent backdrop-blur-md border-b border-brd z-[998] sticky top-0">
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold font-Montserrat text-txt">
          SKILL HUB
        </Link>

        <button
          className="md:hidden text-txt"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        <div
          className={`hidden md:flex md:items-center ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <ul className="flex flex-col md:flex-row md:space-x-6 mt-4 md:mt-0 text-base font-bold font-montserrat text-txt">
            <li>
              <Link
                to="/"
                className="inline-block transition-transform duration-200 hover:scale-105"
              >
                Home
              </Link>
            </li>

            {navUser !== null ? (
              <>
                <li className="relative group">
                  <Link
                    to="/discover"
                    className="flex items-center transition-transform duration-200 hover:scale-105"
                  >
                    Discover{" "}
                    <FaChevronDown className="w-4 h-4 ml-1 hidden md:block" />
                  </Link>

                  {discover && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg z-10 hidden md:group-hover:block bg-bgd">
                      <a
                        href="#for-you"
                        className="block px-4 py-2 text-sm text-txt hover:bg-tl"
                      >
                        For You
                      </a>
                      <a
                        href="#popular"
                        className="block px-4 py-2 text-sm text-txt hover:bg-tl"
                      >
                        Popular
                      </a>
                      <a
                        href="#web-development"
                        className="block px-4 py-2 text-sm text-txt hover:bg-tl"
                      >
                        Web Development
                      </a>
                      <a
                        href="#machine-learning"
                        className="block px-4 py-2 text-sm text-txt hover:bg-tl"
                      >
                        Machine Learning
                      </a>
                      <a
                        href="#others"
                        className="block px-4 py-2 text-sm text-txt hover:bg-tl"
                      >
                        Others
                      </a>
                    </div>
                  )}
                </li>

                <li>
                  <Link
                    to="/chats"
                    className="inline-block transition-transform duration-200 hover:scale-105"
                  >
                    Your Chats
                  </Link>
                </li>

                <li>
                  <UserProfileDropdown />
                </li>
              </>
            ) : (
              <>
                <li className="inline-block transition-transform duration-200 hover:scale-105">
                  <Link to="/about_us">About</Link>
                </li>
                <li className="inline-block transition-transform duration-200 hover:scale-105">
                  <Link to="/login">Login/Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {isOpen && (
          <div className="md:hidden bg-bgl border border-brd w-full px-4 py-4 shadow-md mt-[64px] fixed top-0 left-0 z-40">
            <ul className="flex flex-col space-y-4 text-base font-semibold font-montserrat text-txt">
              <li>
                <Link
                  to="/"
                  className="inline-block transition-transform duration-200 hover:scale-105"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/discover"
                  className="inline-block transition-transform duration-200 hover:scale-105"
                >
                  Discover
                </Link>
              </li>
              <li>
                <Link
                  to="/chats"
                  className="inline-block transition-transform duration-200 hover:scale-105"
                >
                  Your Chats
                </Link>
              </li>
              <li className="absolute right-0">
                <UserProfileDropdown />
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
