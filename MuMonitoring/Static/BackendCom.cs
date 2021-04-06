using MuMonitoring.DTOs;
using MuMonitoring.Static;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring
{
    static class BackendCom
    { 
        private static string BackendURL = "http://127.0.0.1:3000";
        private static HttpClient m_client;

        // API strings 
        private static string m_Const_startSession = "/StartSession";

        public static bool isConnected()
        {
            return m_client != null;
        }

        public static bool Init()
        {
            if (isConnected())
            {
                return true;
            }

            m_client = new HttpClient();

            return true;
        }

        private static string BuildMessage(string type, string message)
        {
            
            return "";
        }

        private static async Task<string> sendPost(string url_, StringContent content)
        {
            var res = m_client.PostAsync(url_, content).Result;
            var resString = await res.Content.ReadAsStringAsync();
            return resString;
        }

        public static async Task<dynamic> Authenticate(Credentials credentials)
        {
            JObject o = new JObject();
            dynamic resObj = null;
            try
            {
                o["username"] = credentials.username;
                var httpContent = new StringContent(o.ToString(), Encoding.UTF8, "application/json");
                string res = sendPost(BackendURL+m_Const_startSession, httpContent).Result;
                resObj = JsonConvert.DeserializeObject(res);
            
                //if ((bool)resObj.success)
                //{
                    //Log.Write(res);
                    //credentials.sessionKey = (string)resObj.data.SessionKey;
                    //ClientConfigDTO config = new ClientConfigDTO(resObj.data.ClientConfig);
                    //StateManager.Init(credentials, config);
                    // continue to app show the key
                    

                //}
                //else
                //{
                //    // show error message
                //    Log.Write("failed initializing session: " + (string)resObj.message);
                //}
                //{ "success":true,"message":"Successsfully initialized Session ID.","data":{ "ProcessName":"main.exe","rotationNotifyTimeMS":21600000,"pollingIntervalMS":"10000","SequentialBadBehaviourFrameSize":30} }

            }catch(Exception exc)
            {
                Log.Write("Error occured when trying to authenticate \n "+exc.Message);
                Log.Write(exc.StackTrace);
            }


            return resObj;
        }
    }
}
