using MuMonitoring.DTOs;
using MuMonitoring.Static;
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

        public static bool Authenticate(Credentials credentials)
        {
            JObject o = new JObject();

            o["username"] = credentials.username;
            var httpContent = new StringContent(o.ToString(), Encoding.UTF8, "application/json");
            //var response = await m_client.PostAsync(BackendURL, httpContent);
            //var res = response.Result;
            //var resString = response.Content.ReadAsStringAsync().Result;
            string res = sendPost(BackendURL+m_Const_startSession, httpContent).Result;
            Log.Write(res);
            return true;
        }
    }
}
