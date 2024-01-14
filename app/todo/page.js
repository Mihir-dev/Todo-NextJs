"use client";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import Card from "@/components/Card";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import {
  ArrowRightStartOnRectangleIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";
import { IoIosLogOut } from "react-icons/io";
import { useRouter } from 'next/navigation';

const idb = window.indexedDB;

const Todo = () => {
  const [create, setCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const [datee, setDatee] = useState();
  const [userTasks, setUserTasks] = useState([]);

  const [updatedTask, setUpdatedTask] = useState(false);

  const [searching, setSearching] = useState(false);
  const router = useRouter()

  

  const searchFunction = (e) => {
    e.preventDefault();
    const dbPromise = idb.open("test-db", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction("userData", "readwrite");
      const userData = tx.objectStore("userData");
      const current = localStorage.getItem("CurrentEmail");

      const users = userData.get(current);
      users.onsuccess = (e) => {
        let data = e.target.result;
        let taskArray = data.tasks;

        let newArray = [];

        if (searchText == "" && searchDate == "") {
          // No Input
          toast.error("Please input the filters");
          fetchTasks();
        } else if (searchText != "" && searchDate == "") {
          // Only Text
          newArray = taskArray.filter((e) => {
            return e.title == searchText || e.description == searchText;
          });
          setUserTasks(newArray);
          setUpdatedTask((prev) => !prev);
          setSearching(true);
          console.log(newArray);
          toast.success("Search Completed");
        } else if (searchText == "" && searchDate != "") {
          // Only Date
          newArray = taskArray.filter((e) => {
            return e.date == searchDate;
          });
          setUserTasks(newArray);
          setUpdatedTask((prev) => !prev);
          setSearching(true);
          toast.success("Search Completed");
        } else if (searchText != "" && searchDate != "") {
          // Both Text and Date
          newArray = taskArray.filter((e) => {
            return (
              (e.title == searchText || e.description == searchText) &&
              e.date == searchDate
            );
          });
          setUserTasks(newArray);
          setUpdatedTask((prev) => !prev);
          setSearching(true);

          toast.success("Search Completed");
        }

        tx.oncomplete = () => {
          db.close();
        };
      };
    };
  };

  const fetchTasks = () => {
    const dbPromise = idb.open("test-db", 2);

    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction("userData", "readwrite");
      const userData = tx.objectStore("userData");
      const current = localStorage.getItem("CurrentEmail");

      const users = userData.get(current);

      users.onsuccess = (e) => {
        const data = e.target.result;
        setUserTasks(data.tasks);
        tx.oncomplete = () => {
          db.close();
        };
        console.log("task fetched");
      };
    };
  };

  const logout = () => {
    localStorage.setItem("CurrentEmail","")
    router.push("/")
  }

  useEffect(() => {
    if (!searching) {
      fetchTasks();
    }
  }, [create, updatedTask, searching]);

  const createTask = (e) => {
    e.preventDefault();

    const task = {
      title: title,
      description: desc,
      date: datee,
      id: uuidv4(),
      done: false,
    };

    const dbPromise = idb.open("test-db", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction("userData", "readwrite");
      const userData = tx.objectStore("userData");
      const current = localStorage.getItem("CurrentEmail");

      const users = userData.get(current);

      users.onsuccess = (e) => {
        let data = e.target.result;
        console.log(data);

        data.tasks = [...(data.tasks || []), task];

        const putRequest = userData.put(data);

        putRequest.onsuccess = () => {
          tx.oncomplete = () => {
            db.close();
          };
          console.log("task added");
          setCreate(false);
          setTitle("");
          setDesc("");
          setDatee("");
          setUpdatedTask((prev) => !prev);
          toast.success("Task Created Successfully");
        };
      };
    };
  };

  

  return (
    <>
      <main className="h-screen w-screen flex flex-col bg-black ">
        <div className="w-screen h-[4.5rem] rounded-b-lg shadow-sm shadow-gray-500/50 -translate-y-0.5 flex items-center py-3.5 px-7 justify-between bg-black">
          <div className="flex items-center space-x-2.5 group">
            <CubeTransparentIcon className="h-10 w-10 text-white group-hover:rotate-180 transition" />
            <p className="text-2xl font-medium text-white company-name">
              TASK ODYSSEY
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className="bg-white/3 text-white/70  flex items-center space-x-3 cursor-pointer  px-3 py-2 rounded-lg hover:scale-105 transition ease-out hover:-translate-y-1 hover:shadow-sm hover:bg-dark-green hover:text-yellow-green hover:shadow-yellow-green"
              onClick={() => setCreate(true)}
            >
              <p> Create Task </p>
              <FaPlus />
            </div>
            <div
              className="bg-white/3 text-white/70  flex items-center space-x-3 cursor-pointer  px-3 py-2 rounded-lg hover:scale-105 transition ease-out hover:-translate-y-1 hover:shadow-sm hover:bg-dark-green hover:text-yellow-green hover:shadow-yellow-green"
              onClick={logout}
            >
              <p> Logout </p>
              <IoIosLogOut className="scale-110" /> 
            </div>
          </div>
        </div>
        <div className="flex w-full h-full items-center justify-center">
          <div className="h-[31rem] w-[65%]  bg-white/2 rounded-lg shadow-2xl flex flex-col pb-7 px-14">
            <div className="flex items-center w-full justify-center py-7">
              <form
                className="bg-black/75 flex items-center px-3.5 py-3 w-full rounded-md space-x-4 "
                id="search"
              >
                <FaSearch onClick={searchFunction} />
                <input
                  className="flex-1 outline-none bg-transparent border-r-2 border-gray-500/20 text-white "
                  value={searchText}
                  onChange={(e) => {setSearchText(e.target.value); }}
                />
                <input
                  type="date"
                  className=" px-2 outline-none  rounded-md text-gray-500/50 bg-white/2"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
                <button
                  hidden
                  type="submit"
                  onClick={(e) => searchFunction(e)}
                ></button>
              </form>
            </div>
            <div className="flex-1 flex items-center justify-center ">
              <div className=" flex flex-col items-center space-y-5 scrollbar-none overflow-y-scroll h-[22rem]  rounded-lg  w-full">
                {/* Card  */}
                {userTasks &&
                  userTasks
                    .slice(0)
                    .reverse()
                    .map((item, id) => {
                      if (item.done == false) {
                        return (
                          <div
                            key={id}
                            className="w-full h-36  flex  rounded-lg bg-black/75 px-3 py-2 "
                          >
                            {" "}
                            <Card
                              title={item.title}
                              desc={item.description}
                              date={item.date}
                              id={item.id}
                              done={item.done}
                              updatedTask={updatedTask}
                              setUpdatedTask={setUpdatedTask}
                            />
                          </div>
                        );
                      }
                    })}

                {userTasks &&
                  userTasks
                    .slice(0)
                    .reverse()
                    .map((item, id) => {
                      if (item.done == true) {
                        return (
                          <div
                            key={id}
                            className="w-full bg-black/75 h-36  flex  rounded-lg  px-3 py-2 "
                          >
                            {" "}
                            <Card
                              title={item.title}
                              desc={item.description}
                              date={item.date}
                              id={item.id}
                              done={item.done}
                              updatedTask={updatedTask}
                              setUpdatedTask={setUpdatedTask}
                            />
                          </div>
                        );
                      }
                    })}

                {userTasks && userTasks.length == 0 && (
                  <div className="h-full w-full flex items-center justify-center">
                    <p>No Tasks Yet :(</p>
                  </div>
                )}

                {!userTasks && (
                  <div className="h-full w-full flex items-center justify-center">
                    <p>No Tasks Yet :(</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      {create && (
        <div className="z-50 fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center rounded-md">
          <div className="h-[29rem] w-[47rem] rounded-md bg-form-gray/50 space-y-2 flex flex-col ">
            <div
              id="header"
              className="flex items-center justify-between px-7 py-3  border-b-2 border-gray-500/40 "
            >
              <p className="text-2xl text-white">Create Task</p>
              <IoIosClose
                className="text-4xl cursor-pointer hover:bg-red-500 text-white hover:text-white rounded-full"
                onClick={() => setCreate(false)}
              />
            </div>
            <div className="flex flex-col px-7  rounded-md flex-1 py-4">
              <div className="flex flex-col space-y-2">
                <p className="text-lg text-white">Title</p>
                <div className="flex">
                  <input
                    type="text"
                    className="outline-none px-3 py-2 rounded-md flex-1 bg-black/30 text-white"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter the title"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-2  mt-3">
                <p className="text-lg text-white">Description</p>
                <div className="flex">
                  <textarea
                    type="text"
                    className="outline-none px-3 py-2 rounded-md flex-1  bg-black/30 text-white"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Enter the description"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-2 mt-3">
                <p className="text-lg text-white">Date</p>
                <div className="flex">
                  <input
                    type="date"
                    className="outline-none px-3 py-2 rounded-md flex-1 bg-black/30 text-white"
                    value={datee}
                    onChange={(e) => setDatee(e.target.value)}
                  />
                </div>
              </div>
              <div className=" flex justify-center items-center mt-7 ">
                <button
                  className=" w-full py-2.5 rounded-md bg-black/35 text-white hover:bg-white hover:text-black transition ease-in-out"
                  onClick={createTask}
                >
                  Create Task!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Todo;

// const continousChange = () => {
//   const dbPromise = idb.open("test-db", 2);
//   dbPromise.onsuccess = () => {
//     const db = dbPromise.result;
//     const tx = db.transaction("userData", "readwrite");
//     const userData = tx.objectStore("userData");
//     const current = localStorage.getItem("CurrentEmail");

//     const users = userData.get(current);
//     users.onsuccess = (e) => {
//       let data = e.target.result;
//       let taskArray = data.tasks;

//       let newArray = []
//       if(searchText != ""){
//         newArray = taskArray.filter((e) => {
//           return e.title == searchText || e.description == searchText;
//         });
//         setUserTasks(newArray);
//         setUpdatedTask((prev) => !prev);
//         setSearching(true);
//         console.log(newArray);
//       }
//       tx.oncomplete = () => {
//         db.close();
//       };
//     }
//   }
// }