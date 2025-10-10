import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { api } from "../lib/api";

export default function LoginDemo(){
  const [email,setEmail] = useState("demo@evania.app");
  const [password,setPassword] = useState("123");
  const [result,setResult] = useState<any>(null);
  return (
    <View style={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"800" }}>Login (Gateway)</Text>
      <TextInput placeholder="email" autoCapitalize="none" value={email} onChangeText={setEmail} style={{borderWidth:1, marginVertical:8, padding:8}}/>
      <TextInput placeholder="password" secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1, marginBottom:8, padding:8}}/>
      <Button title="Login" onPress={async()=>{ const r=await api.login(email,password); setResult(r); }}/>
      {result && <Text style={{marginTop:12}}>Token: {String(result.token).slice(0,24)}...</Text>}
    </View>
  );
}
