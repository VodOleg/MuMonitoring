using System;
using System.Collections.Generic;

namespace MuMonitoring.DTOs
{
    public class dataMessageDTO
    {
        public Credentials creds { get; set; }
        public Dictionary<int, List<ClientProcessDTO>> clients { get; set; }
    }
}
