import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import api from "../../util/api.js";
import { toast } from "react-toastify";

const ReportForm = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    reportedUsername: username || "",
    issue: "",
    issueDescription: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.issue === "" || formData.issueDescription === "") {
      toast.error("Please fill all the details");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post(`/report/create`, formData);
      toast.success(data.message);
      setFormData((prevState) => ({
        ...prevState,
        issue: "",
        issueDescription: "",
      }));
    } catch (error) {
      console.error(error);
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

  return (
    <div className="min-h-screen  flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold text-rd mb-6">REPORT PROFILE</h1>
      <div className="w-full max-w-xl bg-bgd rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block font-medium text-tl mb-1"
            >
              Your Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="reportedUsername"
              className="block font-medium text-tl mb-1"
            >
              Username to be reported
            </label>
            <input
              type="text"
              name="reportedUsername"
              id="reportedUsername"
              placeholder="Enter username to be reported"
              value={formData.reportedUsername}
              onChange={handleChange}
              className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-tl mb-2">
              What was the nature of the issue?
            </label>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="issue"
                  value="Personal conduct"
                  checked={formData.issue === "Personal conduct"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2 text-txt">Personal conduct</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="issue"
                  value="Professional expertise"
                  checked={formData.issue === "Professional expertise"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2 text-txt">Professional expertise</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="issue"
                  value="Others"
                  checked={formData.issue === "Others"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2 text-txt">Others</span>
              </label>
            </div>
          </div>
          <div>
            <label
              htmlFor="issueDescription"
              className="block font-medium text-tl mb-1"
            >
              Describe the issue to us
            </label>
            <textarea
              name="issueDescription"
              id="issueDescription"
              placeholder="Enter description"
              value={formData.issueDescription}
              onChange={handleChange}
              className="w-full p-2  rounded bg-hvr border border-bgd text-txt focus:outline-none"
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-2 text-txt font-medium bg-rd hover:bg-rds rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-tl"
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
