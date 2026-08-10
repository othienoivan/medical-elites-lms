import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
export type AcademicActivityItem={id:string;title:string;detail:string;at:string};
export type StudentLearningOverview={overallProgress:number;totalModules:number;completedModules:number;startedModules:number;activity:AcademicActivityItem[]};
export async function getStudentLearningOverview():Promise<StudentLearningOverview>{const callable=httpsCallable<Record<string,never>,StudentLearningOverview>(functions,"getStudentLearningOverview");return (await callable({})).data;}
