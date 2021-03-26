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

        [JsonProperty("username")]
        public string username { get; set; }
    }
}
