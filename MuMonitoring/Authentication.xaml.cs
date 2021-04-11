using MuMonitoring.DTOs;
using MuMonitoring.Static;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace MuMonitoring
{
    /// <summary>
    /// Interaction logic for Authentication.xaml
    /// </summary>
    public partial class Authentication : UserControl
    {
        private HttpClient m_pClient;
        private string sessionName = "";

        public static readonly RoutedEvent ConnectedEvent = EventManager.RegisterRoutedEvent(
            "Connected", RoutingStrategy.Bubble, typeof(RoutedEventHandler), typeof(Authentication));

        public event RoutedEventHandler Connected
        {
            add { AddHandler(Authentication.ConnectedEvent, value); }
            remove { RemoveHandler(Authentication.ConnectedEvent, value); }
        }


        public Authentication()
        {
            InitializeComponent();
            m_pClient = new HttpClient();
        }

        private void writeMessage(string message)
        {
            
            this.Dispatcher.Invoke(() => {
                this.msgText.Text = message;

            });
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            Credentials userID = new Credentials(UserNameID.Text);
            BackendCom.Authenticate(userID).ContinueWith((task)=> {
                dynamic response = task.Result;        
                if (response != null && (bool)response.success)
                {
                    // call 
                    userID.sessionKey = (string)response.data.SessionKey;
                    ClientConfigDTO config = new ClientConfigDTO(response.data.ClientConfig);
                    StateManager.Init(userID, config);
                    Dispatcher.Invoke(() =>
                    {
                        RaiseEvent(new RoutedEventArgs(Authentication.ConnectedEvent, this));

                    });
                }
                else
                {
                    string message = "Failed creating session: ";
                    if (response != null)
                    {
                        message += response.message;

                    }
                    else
                    {
                        message += "no connection to server";
                    }
                    Log.Write(message);
                    writeMessage(message);
                }
            });
    }

    }
}
