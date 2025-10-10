import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { api } from "../lib/api";

export default function Quests(){
  const [data,setData]=useState<any>(null);
  const [err,setErr]=useState<string>("");
  useEffect(()=>{ api.questsList().then(setData).catch(e=>setErr(String(e))); },[]);
  if(err) return <Text>Error: {err}</Text>;
  if(!data) return <ActivityIndicator/>;
  return (
    <View style={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"800" }}>Quests</Text>
      {data.quests?.map((q:any)=>(
        <Text key={q.id}>• {q.title} ({q.base_points} XP)</Text>
      ))}
    </View>
  );
}
