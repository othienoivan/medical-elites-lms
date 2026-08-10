import { httpsCallable } from "firebase/functions"; import { functions } from "../config/firebase";
export type TutorProfileUpdate={fullName:string;phoneNumber:string;professionalHeadline:string;bio:string;institutionName:string;specialties:string[];qualifications:string[];profilePhoto:string};
export async function updateOwnTutorProfile(input:TutorProfileUpdate):Promise<void>{const callable=httpsCallable<TutorProfileUpdate,{updated:boolean}>(functions,"updateOwnTutorProfile");await callable(input);}
