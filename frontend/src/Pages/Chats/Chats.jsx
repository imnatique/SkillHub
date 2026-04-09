import React, { useEffect, useState, useRef } from "react";
import api from "../../util/api.js";
import { toast } from "react-toastify";
import { useUser } from "../../util/UserContext";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import RequestCard from "./RequestCard";
import { FaTrash } from "react-icons/fa";

var socket;
const Chats = () => {
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [showRequests, setShowRequests] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [acceptRequestLoading, setAcceptRequestLoading] = useState(false);

  const [requestModalShow, setRequestModalShow] = useState(false);

  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatMessageLoading, setChatMessageLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);

  const { user, setUser } = useUser();

  const navigate = useNavigate();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    socket = io(api.defaults.baseURL);
    if (user) {
      socket.emit("setup", user);
    }
    socket.on("message recieved", (newMessageRecieved) => {
      if (selectedChat && selectedChat.id === newMessageRecieved.chatId._id) {
        setChatMessages((prevState) => [...prevState, newMessageRecieved]);
      }
    });
    return () => {
      socket.off("message recieved");
    };
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      setChatLoading(true);
      const tempUser = JSON.parse(localStorage.getItem("userInfo"));
      const { data } = await api.get("/chat");
      toast.success(data.message);
      if (tempUser?._id) {
        const temp = data.data.map((chat) => {
          return {
            id: chat._id,
            name: chat?.users.find((u) => u?._id !== tempUser?._id).name,
            picture: chat?.users.find((u) => u?._id !== tempUser?._id).picture,
            username: chat?.users.find((u) => u?._id !== tempUser?._id)
              .username,
          };
        });
        setChats(temp);
      }
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await api.get("/auth/logout");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatClick = async (chatId) => {
    try {
      setChatMessageLoading(true);
      const { data } = await api.get(
        `/message/getMessages/${chatId}`
      );
      setChatMessages(data.data);
      setMessage("");
      const chatDetails = chats.find((chat) => chat.id === chatId);
      setSelectedChat(chatDetails);
      socket.emit("join chat", chatId);
      toast.success(data.message);
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await api.get("/auth/logout");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setChatMessageLoading(false);
    }
  };

  const sendMessage = async (e) => {
    try {
      socket.emit("stop typing", selectedChat._id);
      if (message === "") {
        toast.error("Message is empty");
        return;
      }
      const { data } = await api.post("/message/sendMessage", {
        chatId: selectedChat.id,
        content: message,
      });
      socket.emit("new message", data.data);
      setChatMessages((prevState) => [...prevState, data.data]);
      setMessage("");
      toast.success(data.message);
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await api.get("/auth/logout");
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const getRequests = async () => {
    try {
      setRequestLoading(true);
      const { data } = await api.get("/request/getRequests");
      setRequests(data.data);
      toast.success(data.message);
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await api.get("/auth/logout");
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const handleTabClick = async (tab) => {
    if (tab === "chat") {
      setShowChatHistory(true);
      setShowRequests(false);
      await fetchChats();
    } else if (tab === "requests") {
      setShowChatHistory(false);
      setShowRequests(true);
      await getRequests();
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setRequestModalShow(true);
  };

  const handleRequestAccept = async (e) => {
    try {
      setAcceptRequestLoading(true);
      const { data } = await api.post("/request/acceptRequest", {
        requestId: selectedRequest._id,
      });
      toast.success(data.message);
      setRequests((prevState) =>
        prevState.filter((request) => request._id !== selectedRequest._id)
      );
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await api.get("/auth/logout");
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  const handleRequestReject = async () => {
    try {
      setAcceptRequestLoading(true);
      const { data } = api.post("/request/rejectRequest", {
        requestId: selectedRequest._id,
      });
      toast.success(data.message);
      setRequests((prevState) =>
        prevState.filter((request) => request._id !== selectedRequest._id)
      );
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await api.get("/auth/logout");
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const { data } = await api.delete(
        `/message/deleteMessage/${messageId}`
      );
      toast.success(data.message);
      setChatMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await api.get("/auth/logout");
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="md:w-1/4 bg-bgd flex flex-col border-r border-brd">
        <div className="flex border-b border-bgd">
          <button
            className={`flex-1 py-2 px-4 font-medium ${
              showChatHistory ? "bg-tl text-bgd" : "bg-txt text-bgd"
            } rounded-t-lg border border-brd`}
            onClick={() => handleTabClick("chat")}
          >
            Chat History
          </button>
          <button
            className={`flex-1 py-2 px-4 font-medium ${
              showRequests ? "bg-tl text-bgd" : "bg-txt text-bgd"
            } rounded-t-lg border border-brd`}
            onClick={() => handleTabClick("requests")}
          >
            Requests
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showChatHistory && (
            <div className="py-2">
              {chatLoading ? (
                <div className="flex justify-center items-center mt-5">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tl"></div>
                </div>
              ) : (
                <>
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleChatClick(chat.id)}
                      className={`cursor-pointer mb-2 p-2 bg-hvr rounded ${
                        selectedChat?.id === chat?.id ? "text-gr" : "text-txt"
                      }`}
                    >
                      {chat.name}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          {showRequests && (
            <div className="p-2">
              {requestLoading ? (
                <div className="flex justify-center items-center mt-5">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tl"></div>
                </div>
              ) : (
                <>
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      onClick={() => handleRequestClick(request)}
                      className={`cursor-pointer text-txt mb-2 p-2 rounded ${
                        selectedRequest && selectedRequest.id === request.id
                          ? "bg-gr"
                          : "bg-hvr"
                      }`}
                    >
                      {request.name}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-[calc(100vh-60px)] md:h-screen">
        {selectedChat && (
          <div className="flex justify-between items-center p-2 border-b border-brd min-h-[50px]">
            <div className="flex items-center">
              <img
                src={
                  selectedChat?.picture
                    ? selectedChat.picture
                    : "https://via.placeholder.com/150"
                }
                alt="Profile"
                className="w-10 h-10 rounded-full mr-2"
              />
              <span className="font-sans text-txt font-medium">
                {selectedChat?.username}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {selectedChat ? (
            <div className="space-y-3">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender._id === user._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="flex flex-row items-end max-w-[90%] md:max-w-[80%]">
                    <div
                      className={`p-3 border border-brd rounded-lg break-words ${
                        message.sender._id === user._id
                          ? "bg-tl text-bgd"
                          : "bg-hvr text-txt"
                      }`}
                    >
                      {message.content}
                    </div>

                    {message.sender._id === user._id && (
                      <button
                        onClick={() => deleteMessage(message._id)}
                        className="text-rd text-sm ml-2 hover:text-rds"
                      >
                        <FaTrash className="inline-block" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex justify-center items-center">
              {chatMessageLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tl"></div>
              ) : (
                <h3 className="text-center text-gr">
                  Select a chat to start messaging
                </h3>
              )}
            </div>
          )}
        </div>

        {selectedChat && (
          <div className="p-3 border-t border-bgd bg-bgd">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 p-2 mr-2 rounded bg-hvr text-txt focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
              <button
                className="border border-line bg-gr hover:bg-grs text-txt py-2 px-4 rounded"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {requestModalShow && (
        <div
          className="fixed inset-0 bg-bgd bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setRequestModalShow(false)}
        >
          <div
            className="bg-bgd p-6 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-center text-xl text-rd font-bold mb-4">
              Confirm your choice?
            </h2>
            {selectedRequest && (
              <RequestCard
                name={selectedRequest?.name}
                skills={selectedRequest?.skillsProficientAt}
                rating="4"
                picture={selectedRequest?.picture}
                username={selectedRequest?.username}
                bio={selectedRequest?.bio}
                onClose={() => setSelectedRequest(null)}
              />
            )}
            <div className="flex justify-center space-x-4 mt-4">
              <button
                className="bg-gr hover:bg-grs text-txt py-2 px-4 rounded"
                onClick={handleRequestAccept}
              >
                {acceptRequestLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-tl"></div>
                  </div>
                ) : (
                  "Accept!"
                )}
              </button>
              <button
                className="bg-rd hover:bg-rds text-txt py-2 px-4 rounded"
                onClick={handleRequestReject}
              >
                {acceptRequestLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-tl"></div>
                  </div>
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
