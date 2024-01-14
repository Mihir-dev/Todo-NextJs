"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TiTick } from "react-icons/ti";
import { IoIosClose } from "react-icons/io";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
const idb = window.indexedDB;

const Card = ({ title, desc, date, id, done, updatedTask, setUpdatedTask }) => {
  const [complete, setComplete] = useState(done);
  const [edit, setEdit]  = useState(false)

  const [titleEdit, setTitleEdit] = useState(title)
  const [descEdit, setDescEdit] = useState(desc)
  const [datee, setDatee] = useState(date)

  

  const [completionToggle, setCompletionToggle] = useState(false)

  useEffect(() =>{
    return
  },[completionToggle])

  const deleteTask = () => {
    const dbPromise = idb.open("test-db",2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result
      const tx = db.transaction("userData", "readwrite")
      const userData = tx.objectStore("userData")
      const current = localStorage.getItem("CurrentEmail")

      const users = userData.get(current);

      users.onsuccess =(e) => {
        let data = e.target.result
        let taskArray = data.tasks;

        const newArray = taskArray.filter((e) => {
          return e.id != id;
        });

        data.tasks = newArray;

        const putRequest = userData.put(data);

        putRequest.onsuccess = () => {
          tx.oncomplete = () => {
            db.close();
          };
          console.log("Task Deleted");
          toast("Task Deleted Successfully", {
            icon: "🎊",
          });
        };

        setUpdatedTask(prev => !prev)





      }



    }
  }

  const editTask = (e) => {
    e.preventDefault();
    setUpdatedTask(prev => !prev)
    const dbPromise = idb.open("test-db", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result
      const tx = db.transaction("userData", "readwrite")
      const userData = tx.objectStore("userData")
      const current = localStorage.getItem("CurrentEmail")

      const users = userData.get(current);
      users.onsuccess = (e) => {
        let data = e.target.result
        let taskArray = data.tasks;

        taskArray.forEach((e) =>{
          if(e.id == id){
            e.title = titleEdit;
            e.description = descEdit;
            e.date = datee
          }
        });

        const putRequest = userData.put(data);

        putRequest.onsuccess = () => {
          tx.oncomplete = () => {
            db.close();
          };
          console.log("Task Completed");
          toast("Task Edit Successfully", {
            icon: "🎊",
          });
        };

        setEdit(false);
        setUpdatedTask(prev => !prev)
        
      }
      
    }

  }

  const completed = () => {
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

        // Try
        taskArray.forEach((element) => {
          if (element.id === id) {
            element.done = true;
          }
        });

        setComplete(true);

        data.tasks = taskArray;

        console.log(taskArray);

        const putRequest = userData.put(data);

        putRequest.onsuccess = () => {
          tx.oncomplete = () => {
            db.close();
          };
          console.log("Task Completed");
          setCompletionToggle(prev => !prev)
          setUpdatedTask(prev => !prev)
          toast("Task Completed", {
            icon: "🎊",
          });
        };
      };
    };
  };

  return (
    <>
      <div className={`flex flex-col border-r-2 border-gray-500/15 text-white/75  ${done ? "line-through" : "hover:text-yellow-green"} transition ease-in-out px-3 py-2 flex-1`}>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="h-16">{desc}</p>
        </div>
        <div className=" flex justify-between  items-center">
          <p className="text-sm">{date}</p>
          {/* <button>Edit</button> */}
        </div>
      </div>
      <div className=" flex  space-y-2 flex-col items-center justify-center ml-1.5 px-5">
        <div
          onClick={deleteTask}
          className={`cursor-pointer  px-1.5 py-1.5 hover:bg-red-500  hover:text-white rounded-full hover:scale-110 transition`}
        >
          <IoCloseSharp  className={`font-medium text-2xl `} />
        </div>
        <div
          onClick={() => {setEdit(true); setTitleEdit(title); setDescEdit(desc); setDatee(date)}}
          className={` ${done ? "" : "cursor-pointer"}  px-[0.575rem] py-[0.575rem] hover:bg-amber-500 hover:text-white rounded-full hover:scale-110 transition`}
        >
          <MdEdit className={`font-normal text-xl `} />
        </div>
        <div
          onClick={completed}
          className={`cursor-pointer ${
            done ? "bg-emerald-500 text-white" : ""
          } px-1.5 py-1.5 hover:bg-emerald-500 hover:text-white rounded-full hover:scale-110 transition`}
        >
          <TiTick className={`font-medium text-2xl `} />
        </div>
      </div>
      {
        edit &&
        (
        <div className="z-50 fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center rounded-md">
          <div className="h-[29rem] w-[47rem] rounded-md bg-form-gray/50 space-y-2 flex flex-col ">
            <div
              id="header"
              className="flex items-center justify-between px-7 py-3   border-b-2 border-gray-500/40 "
            >
              <p className="text-2xl text-white">Edit Task</p>
              <IoIosClose
                className="text-4xl cursor-pointer hover:bg-red-500 text-white hover:text-white rounded-full"
                onClick={() => setEdit(false)}
              />
            </div>
            <div className="flex flex-col px-7  rounded-md flex-1 py-4">
              <div className="flex flex-col space-y-2">
                <p className="text-lg text-white">Enter the title</p>
                <div className="flex">
                  <input
                    type="text"
                    className="outline-none px-3 py-2 rounded-md flex-1 bg-black/30 text-white"
                    value={titleEdit}
                    onChange={(e) => setTitleEdit(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-2  mt-3">
                <p className="text-lg text-white">Enter the Description</p>
                <div className="flex">
                  <textarea
                    type="text"
                    className="outline-none px-3 py-2 rounded-md flex-1  bg-black/30 text-white"
                    value={descEdit}
                    onChange={(e) => setDescEdit(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-2 mt-3">
                <p className="text-lg text-white">Enter the data</p>
                <div className="flex">
                  <input
                    type="date"
                    className="outline-none px-3 py-2 rounded-md flex-1 bg-black/30 text-white"
                    value={datee}
                    onChange={(e) => setDatee(e.target.value)}
                  />
                </div>
              </div>
              <div className=" flex justify-center items-center mt-5 ">
                <button
                  className="w-full py-2.5 rounded-md bg-black/35 text-white hover:bg-white hover:text-black transition ease-in-out"
                  onClick={editTask}
                >
                  Edit Task!
                </button>
              </div>
            </div>
          </div>
        </div>
      )

      }
    </>
  );
};

export default Card;
