using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring.DTOs
{
    public class dataMessageDTO
    {
        public Credentials creds { get; set; }
        public List<ClientProcessDTO> clients { get; set; }
    }
}
