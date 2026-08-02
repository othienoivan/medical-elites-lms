type Item<T>={value:T;expiresAt:number};
const cache=new Map<string,Item<unknown>>();
export async function withTtlCache<T>(key:string, ttlMs:number, loader:()=>Promise<T>):Promise<T>{
  const now=Date.now(); const hit=cache.get(key) as Item<T>|undefined;
  if(hit && hit.expiresAt>now) return hit.value;
  const value=await loader(); cache.set(key,{value,expiresAt:now+ttlMs}); return value;
}
export function clearTtlCache(prefix?:string):void{ for(const key of cache.keys()) if(!prefix||key.startsWith(prefix)) cache.delete(key); }
