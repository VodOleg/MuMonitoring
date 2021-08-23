using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring.DTOs
{
    public class ClientProcessDTO:IEquatable<ClientProcessDTO>
    {
        //public ;
        public int processID { get; set; }
        public string alias { get; set; }
        public bool disconnected { get; set; }
        public bool suspicious { get; set; }
        public DateTime timestamp { get; set; }
        public DateTime processStarted { get; set; }
        public DateTime monitorStartTime { get; set; }


        public bool Equals(ClientProcessDTO other)
        {
            return processID==other.processID && disconnected==other.disconnected && suspicious == other.suspicious;
        }
    }
}
