using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring.DTOs
{
    public class Credentials
    {
        public Credentials() { }
        public Credentials(string user) { this.username = user; }
        
        public Credentials(Credentials user) { this.username = user.username; this.sessionKey = user.sessionKey; }

        public string sessionKey { get; set; }

        [JsonProperty("username")]
        public string username { get; set; }
    }
}
