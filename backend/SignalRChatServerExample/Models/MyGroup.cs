using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatServerExample.Models
{
    public class MyGroup
    {
        public string GroupName { get; set; }
        public List<MyClient> Clients { get; } = new List<MyClient>();
    }
}
