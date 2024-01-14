"use client";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import Card from "@/components/Card";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

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

  const [searching, setSearching] = useState(false)


  const searchFunction = (e) => {
    e.preventDefault();
    const dbPromise = idb.open("test-db", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result
      const tx = db.transaction("userData", "readwrite")
      const userData = tx.objectStore("userData")
      const current = localStorage.getItem("CurrentEmail")

      const users = userData.get(current);
      users.onsuccess = (e) => 
      {
        let data = e.target.result;
        let taskArray = data.tasks;

        let newArray = [];

        if(searchText == "" && searchDate == ""){
          // No Input
          toast.error("Please input the filters")
          fetchTasks()
        }

        else if (searchText !="" && searchDate== ""){
          // Only Text
          newArray = taskArray.filter((e) => {
            return e.title == searchText || e.description == searchText
          })
          setUserTasks(newArray)
          setUpdatedTask(prev => !prev)
          setSearching(true)
          console.log(newArray)
          toast.success("Search Completed")
        }

        else if (searchText == "" && searchDate != ""){
          // Only Date
          newArray = taskArray.filter((e) => {
            return e.date == searchDate
          })
          setUserTasks(newArray)
          setUpdatedTask(prev => !prev)
          setSearching(true)
          toast.success("Search Completed")
        }

        else if(searchText != "" && searchDate != ""){
          // Both Text and Date
          newArray = taskArray.filter((e) => {
            return ((e.title == searchText || e.description == searchText) && (e.date == searchDate))
          })
          setUserTasks(newArray)
          setUpdatedTask(prev => !prev)
          setSearching(true)

          toast.success("Search Completed")
        }

        tx.oncomplete = () => {
          db.close();
        };

      }
    }
  }

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

  useEffect(() => {
    if(!searching){
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
          setUpdatedTask(prev => !prev)
          toast.success("Task Created Successfully");
        };
      };
    };
  };

  return (
    <>
      <main className="h-screen w-screen flex flex-col ">
        <div className="w-screen h-[4.5rem] rounded-b-lg shadow-lg  flex items-center py-2 px-7 justify-between bg-white">
          <div>
            <p className="text-2xl font-bold text-black">TODO...</p>
          </div>

          <div
            className="flex items-center space-x-3 cursor-pointer border px-3 py-2 rounded-lg hover:scale-105 transition ease-out hover:-translate-x-1 hover:shadow-md hover:bg-emerald-500 hover:text-white hover:shadow-[#08FF08]"
            onClick={() => setCreate(true)}
          >
            <p> Create Task </p>
            <FaPlus />
          </div>
        </div>
        <div className="flex w-full h-full items-center justify-center">
          <div className="h-[85%] w-[70%] border  rounded-lg shadow-2xl flex flex-col pb-7">
            <div className="flex items-center w-full justify-center py-7   ">
              <form
                className="border flex items-center px-3.5 py-3 w-[80%] rounded-md space-x-4 "
                id="search"
              >
                <FaSearch onClick={searchFunction}/>
                <input className="flex-1 outline-none border-r-2 border-gray-300" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                <input
                  type="date"
                  className="border px-2 outline-none rounded-lg"
                  value ={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
                <button hidden type="submit" onClick={(e) => searchFunction(e)}></button>
              </form>
            </div>
            <div className="flex-1 flex items-center justify-center ">
              <div className="border flex flex-col items-center space-y-5 scrollbar-thin overflow-y-scroll h-[22rem]  rounded-lg py-5 w-[80%]">
                {/* Card  */}
                {userTasks &&
                  userTasks
                    .slice(0)
                    .reverse()
                    .map((item, id) => {
                      if(item.done == false)
                      {return (
                        <div
                          key={id}
                          className="w-[90%] h-36  flex  rounded-lg border px-3 py-2 "
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
                      );}
                    })}

                    {userTasks &&
                  userTasks
                    .slice(0)
                    .reverse()
                    .map((item, id) => {
                      if(item.done == true)
                      {return (
                        <div
                          key={id}
                          className="w-[90%] h-36  flex  rounded-lg border px-3 py-2 "
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
                      );}
                    })}

                    {
                      userTasks && userTasks.length == 0 && (
                        <div className="h-full w-full flex items-center justify-center">
                    <p>No Tasks Yet :(</p>
                  </div>
                      )
                    }

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
          <div className="h-[30rem] w-[50rem] rounded-md bg-gray-100 space-y-2 flex flex-col ">
            <div
              id="header"
              className="flex items-center justify-between px-7 py-3  border-b-2 border-gray-500 "
            >
              <p className="text-2xl ">Create Task</p>
              <IoIosClose
                className="text-4xl cursor-pointer hover:bg-red-500 hover:text-white rounded-full"
                onClick={() => setCreate(false)}
              />
            </div>
            <div className="flex flex-col px-7  rounded-md flex-1 py-4">
              <div className="flex flex-col space-y-2">
                <p className="text-lg">Enter the title</p>
                <div className="flex">
                  <input
                    type="text"
                    className="outline-none px-3 py-2 rounded-md flex-1 border"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-2  mt-3">
                <p className="text-lg">Enter the Description</p>
                <div className="flex">
                  <textarea
                    type="text"
                    className="outline-none px-3 py-2 rounded-md flex-1 border"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-2 mt-3">
                <p className="text-lg">Enter the data</p>
                <div className="flex">
                  <input
                    type="date"
                    className="outline-none px-3 py-2 rounded-md flex-1 border"
                    value={datee}
                    onChange={(e) => setDatee(e.target.value)}
                  />
                </div>
              </div>
              <div className=" flex justify-center items-center mt-5 ">
                <button
                  className=" w-[50%] py-2.5 rounded-md border hover:bg-black hover:text-white transition ease-out"
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
