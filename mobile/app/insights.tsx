import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { api } from "../lib/api";

export default function Insights(){
  const [data,setData]=useState<any>(null);
  const [err,setErr]=useState<string>("");
  useEffect(()=>{ api.insightsWeekly().then(setData).catch(e=>setErr(String(e))); },[]);
  if(err) return <Text>Error: {err}</Text>;
  if(!data) return <ActivityIndicator/>;
  return (
    <View style={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"800" }}>Weekly Insights</Text>
      <Text>Risk: {data.riskBand}</Text>
      <Text>Quests: {data.totals?.questsCompleted}</Text>
    </View>
  );
}
