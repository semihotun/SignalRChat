using SignalRChatServerExample.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatServerExample.Data
{
    public static  class ClientSource
    {
        public static List<MyClient> Clients { get; } = new List<MyClient>();
    }
}
