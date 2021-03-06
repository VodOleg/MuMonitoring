using System;

namespace MuMonitoring
{
    public class SessionData
    {
        public SessionData()
        {
            sent = 0;
            received = 0;
            cpuUsage = 0;
            timestamp = DateTime.Now;
            disconnected = false;
            suspicious = false;
            reason = "";
            subsetsCount = 0;
        }
        public int sent { get; set; }
        public int received { get; set; }
        public DateTime timestamp { get; set; }
        public int subsetsCount { get; set; }
        public double cpuUsage { get; set; }
        public bool disconnected { get; set; }
        public bool suspicious { get; set; }
        public string reason { get; set; }
        public void hardCopy(SessionData other)
        {
            this.sent = other.sent;
            this.received = other.received;
            this.cpuUsage = other.cpuUsage;
            this.timestamp = other.timestamp;
            this.disconnected = other.disconnected;
            this.suspicious = other.suspicious;
            this.reason = other.reason;
            this.subsetsCount = other.subsetsCount;
        }

        public override string ToString()
        {
            string dat = $"SessionData: received={this.received}, dc={disconnected} suspicious={suspicious}, timestamp={timestamp}";
            return dat;
        }
    }
}
