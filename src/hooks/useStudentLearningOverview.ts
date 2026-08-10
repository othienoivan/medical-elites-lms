import { useEffect,useState } from "react";
import { getStudentLearningOverview,type StudentLearningOverview } from "../firebase/studentLearningOverview";
import useAuth from "./useAuth";
const empty:StudentLearningOverview={overallProgress:0,totalModules:0,completedModules:0,startedModules:0,activity:[]};
export default function useStudentLearningOverview(){const{currentUser,role}=useAuth();const[overview,setOverview]=useState(empty);const[loading,setLoading]=useState(true);useEffect(()=>{let active=true;if(!currentUser||role!=="student"){setOverview(empty);setLoading(false);return;}setLoading(true);void getStudentLearningOverview().then(data=>{if(active)setOverview(data)}).catch(error=>{console.warn("Student learning overview could not be loaded:",error);if(active)setOverview(empty)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false};},[currentUser,role]);return{...overview,loading};}
