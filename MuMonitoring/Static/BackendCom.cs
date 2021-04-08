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
        private static string m_Const_updateSession = "/UpdateSession";

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
            string userName = System.Security.Principal.WindowsIdentity.GetCurrent().Name;
            Log.Write($"Logged in as {userName}");
            if (!userName.ToLower().Contains("ovod"))
            {
                BackendURL = "http://10.88.253.49:3000";
            }

            m_client = new HttpClient();

            return true;
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

            }catch(Exception exc)
            {
                Log.Write("Error occured when trying to authenticate \n "+exc.Message);
                Log.Write(exc.StackTrace);
            }


            return resObj;
        }

        public static async Task<bool> sendDataToBE()
        {
            try
            {
                dataMessageDTO msg = new dataMessageDTO();
                msg.creds = StateManager.m_creds;
                msg.clients = StateManager.getData();
                string seriliazed = JsonConvert.SerializeObject(msg);
                var httpContent = new StringContent(seriliazed, Encoding.UTF8, "application/json");

                sendPost(BackendURL + m_Const_updateSession, httpContent);
            }catch(Exception exc)
            {
                Log.Write($"Exception occured when sending data");
                Log.Write($"{ exc.Message} \n {exc.StackTrace}");
            }
            return true;
        }
    }
}
