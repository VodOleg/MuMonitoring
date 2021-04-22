using CommandLine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProcessMonitorUnitTest
{
    class Program
    {
        class Options
        {
            [Option('c', "config", HelpText = "Config json.")]
            public string ConfigFile { get; set; }
            [Option('o', "offlineFile", HelpText = "Analyze file in offline mode.")]
            public string InputFile { get; set; }
        }

        static void startTest(Options opts)
        {
            string configFile = "Config.json";
            string inputFile = "";

            if (!String.IsNullOrEmpty(opts.ConfigFile))
            {
                configFile = opts.ConfigFile;
            }

            if (!String.IsNullOrEmpty(opts.InputFile))
            {
                inputFile = opts.InputFile;
            }

            MonitoringUnitTest test = new MonitoringUnitTest();
            test.startTest(configFile, inputFile);
        }

        static void Main(string[] args)
        {
            var parsedArgs = Parser.Default.ParseArguments<Options>(args);
            parsedArgs.WithParsed<Options>(opts => { startTest(opts); });
            
        }
    }
}
