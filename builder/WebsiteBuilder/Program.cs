using System.Configuration;

namespace WebsiteBuilder
{
    class Program
    {
        static void Main(string[] args)
        {
            var inputPath = ConfigurationManager.AppSettings["WebsitePath"];
            var outputPath = ConfigurationManager.AppSettings["OutputPath"];

            new SiteBuilder().Build(inputPath, outputPath);
        }
    }
}
