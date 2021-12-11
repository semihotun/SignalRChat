import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import * as signalR from '@microsoft/signalr';         

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit{

  constructor() { }

  ngOnInit() {
    const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:44344/chathub")
            .build();
        connection.start();

        const divStatus = $('#clientDurum');

        $(".disabled").attr("disabled", "disabled");

        $("body").on("click", ".users", function() {
            $(".users").each((index, item) => {
                item.classList.remove("active");
            });
            $(this).addClass("active");
        });

        $("#btnSend").click(() => {
            const clientName = $(".users.active").first().html();
            const message:string = $("#txtMessage").val()?.toLocaleString() ?? "";
            //Serveri tetikletmek için invoke cagırıyoruz.
            connection.invoke("SendMessageAsync", message, clientName);

            const _message = $(".mesaj").clone();
            _message.find("p").html(message);
            $(".mesaj h5:eq(1)").html("Sen");
            $(".mesaj h5:eq(0)").html("");
            _message.removeClass("mesaj");
            $("#mesajlar").append(_message);
        });

        //Kullanıcıyı Login edelim ve ardından bu method servera gidip alttaki methodları cagırsın
        $("#btnLogin").click(() => {
            var nickName = $("#txtNickName").val();
            connection.invoke("GetNickName", nickName)
                .catch(err =>
                    console.log(err));
                

            $(".disabled").removeAttr("disabled");
            $(".disabled").removeClass("disabled");
         
            connection.on("sendThisConnectionId", (conId) => {
                $("#showConnectionId").html(conId);
            });
        });

        connection.on("clientJoined", nickName => {
            console.log("clientJoinde");
            $("#clientDurum").html(`${nickName} giriş yaptı.`);
            $("#clientDurum").fadeIn(2000, () => {
                setTimeout(() => {
                    $("#clientDurum").fadeOut(2000);
                }, 2000)
            });
        });

        connection.on("allClients", clients => {
            $("#_clients").html("");
            $.each(clients, (index, item) => {
                const user = $(".users").first().clone();
                user.removeClass("active");
                user.html(item.nickName);
                $("#_clients").append(user);
            });
        });
        //Serverdaki method tetıkledın client tarafında bu methodu yakalıyoruz.
        connection.on("receiveMessage", (message, senderer) => {
            const _message = $(".mesaj").clone();
            _message.find("p").html(message);
            $(".mesaj h5:eq(0)").html(senderer);
            $(".mesaj h5:eq(1)").html("");
            _message.removeClass("mesaj");
            $("#mesajlar").append(_message);
        });



        //Group Methodları  addedGroup
        //Grup oluşturma
        $("#btnCreateRoom").click(() => {
            var roomName = $("#txtRoomName").val();
            connection.invoke("CreateGroup", roomName);
        });
        //Grup oluşturulduktan sonra clientlari etkileyen method
        connection.on("addedGroup", roomName => {
            $("#selectedRooms").append(new Option(roomName, roomName));
        });

        //Gruba katıl
        $("#btnJoinGroup").click(() => {
            var selectedRooms = $("#selectedRooms").val();
            connection.invoke("JoinGroup", selectedRooms);
        });

        //Selecten odaya tıklandıgında alta odada olan clientlar gelsin
        $("#selectedRooms").change(function() {
            var room = $(this).val()?.toString();
            _selectedGroup = room;
            connection.invoke("SendGroupClients", room);
        });

        let _selectedGroup:string|undefined = "";

        //Gruba mesaj gönder 
        $("#btnGroupSend").click(() => {
            const message:string = $("#txtMessage").val()?.toLocaleString() ?? "";
            console.log('test');
            if (_selectedGroup !== "") {
                connection.invoke("SendMessageToGroup", _selectedGroup, message);
                const _message = $(".mesaj").clone();
                _message.find("p").html(message);
                // _message.find("h5")[1].html = "Sen";
                $(".mesaj h5:eq(1)").html("Sen");
                $(".mesaj h5:eq(0)").html("");
                _message.removeClass("mesaj");
                $("#mesajlar").append(_message);
            }
        });
  }

}
