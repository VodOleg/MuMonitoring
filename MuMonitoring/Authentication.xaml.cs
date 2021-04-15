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
        }

        private void writeMessage(string message)
        {
            
            this.Dispatcher.Invoke(() => {
                this.msgText.Text = message;

            });
        }

        private void authenticate(string username)
        {
            Credentials userID = new Credentials(username);

            string response = BackendCom.Authenticate(userID);
            if (String.IsNullOrEmpty(response))
            {
                Dispatcher.Invoke(() =>
                {
                    RaiseEvent(new RoutedEventArgs(Authentication.ConnectedEvent, this));

                });
            }
            else
            {
                writeMessage(response);
            }
            
            
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            string username = UserNameID.Text;

            Task tsk = new Task(() => { authenticate(username); });
            tsk.Start();

        }

        private void UserNameID_TextChanged(object sender, TextChangedEventArgs e)
        {
            Regex regex1 = new Regex(@"^[a-zA-Z0-9_]+$");
            string ne_msg = UserNameID.Text;
            string old = UserNameID.Text.Substring(0, UserNameID.Text.Length - e.Changes.Count);
            if (ne_msg.Length <= 10 && regex1.IsMatch(ne_msg))
            {
                sessionName = ne_msg;
            }
            else
            {
                sessionName = old;
                UserNameID.Text = old;
            }
        }
    }
}
