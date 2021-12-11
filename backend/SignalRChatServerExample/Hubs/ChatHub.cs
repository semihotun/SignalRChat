using Microsoft.AspNetCore.SignalR;
using SignalRChatServerExample.Data;
using SignalRChatServerExample.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatServerExample.Hubs
{
    public class ChatHub : Hub
    {
        //clienti bul
        public MyClient ThisClient()
        {
            return ClientSource.Clients.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
        }

        public async Task GetNickName(string nickName)
        {
            MyClient myClient = new MyClient()
            {
                ConnectionId = Context.ConnectionId,
                NickName = nickName
            };

            ClientSource.Clients.Add(myClient);
            //Clientlara , ilgili clientin girişi yaptıgı bılgısını gonderır.
            await Clients.Others.SendAsync("clientJoined", nickName);

            //Tüm clientlara Nicknameleri gönderir/günceller.
            await Clients.All.SendAsync("allClients", ClientSource.Clients);

            //İlgili clienta connectionId gonder
            await Clients.Caller.SendAsync("sendThisConnectionId", ThisClient().ConnectionId);
        }

        public async Task SendMessageAsync(string message, string clientName)
        {

            if (clientName == "Tümü")
            {
                await Clients.Others.SendAsync("receiveMessage", message, ThisClient().NickName);
            }
            else
            {
                MyClient client = ClientSource.Clients.FirstOrDefault(x => x.NickName == clientName);
                await Clients.Client(client.ConnectionId).SendAsync("receiveMessage", message, ThisClient().NickName);
            }
        }

        public async Task CreateGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            var group = new MyGroup() { GroupName = groupName };
            group.Clients.Add(ThisClient());
            GroupSource.Groups.Add(group);

            await Clients.All.SendAsync("addedGroup", groupName);
        }

        public async Task JoinGroup(IEnumerable<string> groups)
        {
            foreach (var group in groups)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, group);

                var _group = GroupSource.Groups.FirstOrDefault(x => x.GroupName == group);

                if (!_group.Clients.Any(x => x.ConnectionId == ThisClient().ConnectionId))
                    _group.Clients.Add(ThisClient());
            }
        }
        public async Task SendGroupClients(string groupName)
        {
            var thisGroup = GroupSource.Groups.FirstOrDefault(x => x.GroupName == groupName);
            await Clients.Caller.SendAsync("allClients", groupName == "Tümü" ? ClientSource.Clients : thisGroup.Clients);
        }

        public async Task SendMessageToGroup(string groupName,string message)
        {
            await Clients.Group(groupName).SendAsync("receiveMessage", message,ThisClient().NickName);
        }

    }
}
