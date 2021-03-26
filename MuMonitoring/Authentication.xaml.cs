using MuMonitoring.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
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
        public Authentication()
        {
            InitializeComponent();
            m_pClient = new HttpClient();
    }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            Credentials userID = new Credentials(UserNameID.Text);
            BackendCom.Authenticate(userID);
    }
    }
}
