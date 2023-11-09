import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import "./App.css";
import { useSnackbar } from 'notistack';

interface Job {
  id: string;
  job_name: string;
  status: string;
  created: string;
  tasks: Task[];
}

interface Task {
  task_id: string;
  task_name: string;
  status: string;
  created: string;
  updated?: string;
}

const backend_url = "http://localhost:5000";

const App: React.FC = () => {
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .post(backend_url + "/jobs", { jobTitle })
      .then((response) => {
        enqueueSnackbar(`${jobTitle} started`, { variant: 'success' });
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });

    setJobTitle("");
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      axios
        .get(backend_url + "/jobs")
        .then((response) => {
          setJobs(response.data.jobs);
        })
        .catch((error) => {
          console.log(error);
        });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = () => {
    axios
      .delete(backend_url + "/jobs")
      .then(() => {
        setJobs([]);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-200 bg-white p-10">
      <form onSubmit={handleSubmit} className="flex flex-row bg-white p-4 rounded-md shadow-md justify-center items-center">
        <input
          type="text"
          id="jobTitle"
          name="jobTitle"
          className="p-2 border border-gray-300 rounded-md mr-10"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Enter job title"
        />
        <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200">
          Create Job workflow
        </button>
      </form>

      <div className="flex ml-80 items-start justify-start flex-grow w-full">
        <button onClick={handleDelete} className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-blue-600 transition duration-200">
          Clear All Jobs
        </button>
      </div>
      <JobList jobs={jobs} />
    </div>
  );
};

export default App;

const JobList: React.FC<{ jobs: Job[] }> = ({ jobs }) => (
  <div className="p-4">
    {jobs.map((job) => (
      <Job key={job.id} job={job} />
    ))}
  </div>
);

const Job: React.FC<{ job: Job }> = ({ job }) => {
  const handleCancelJob = (jobID: string) => {
    axios
      .get(backend_url + `/jobs/${jobID}/cancel`)
      .then(() => { /* handle response */ })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="p-4 m-2 bg-white shadow-md rounded">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Job Name: {job.job_name}</h1>
          <div className="flex items-center">
            <p className="mb-4 mr-2">Job Status:</p>
            <StatusChip status={job.status} />
          </div>
          <p className="mb-4">Started: {dateToLocal(job.created)}</p>
        </div>
        <div>
          {job.status !== "Completed" && job.status !== "Canceled" ? (
            <button onClick={() => handleCancelJob(job.id)} className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-blue-600 transition duration-200">
              Cancel Job
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex">
        {job.tasks.map((task) => (
          <TaskComponent key={task.task_id} task={task} />
        ))}
      </div>
    </div>
  );
};

const TaskComponent: React.FC<{ task: Task }> = ({ task }) => {
  const handleResumeJob = (taskID: string) => {
    axios
      .get(backend_url + `/jobs/task/${taskID}/resume`)
      .then(() => { /* handle response */ })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="p-2 border-r-2 border-l-2 border-gray-200">
      <h2 className="text-lg font-bold">Task Name: {task.task_name}</h2>

      <div className="flex items-center">
        <p className="mb-4 mr-2">Status:</p>
        <StatusChip status={task.status} />
      </div>

      <p>Created At: {dateToLocal(task.created)}</p>
      <p>Updated At: {task.updated ? dateToLocal(task.updated) : ""}</p>

      {task.status === "Waiting" && (
        <button onClick={() => handleResumeJob(task.task_id)} className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-blue-600 transition duration-200">
          Resume Job
        </button>
      )}
    </div>
  );
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const color = getStatusColor(status);
  return <span className={`mb-4 inline-block py-1 px-2 rounded-full text-sm text-white ${color}`}>{status}</span>;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Started":
      return "bg-green-500";
    case "Waiting":
      return "bg-yellow-500";
    case "Completed":
      return "bg-blue-500";
    case "Canceled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const dateToLocal = (dateStr: string): string => {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleString();
};
