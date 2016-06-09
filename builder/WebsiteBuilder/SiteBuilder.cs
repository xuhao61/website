using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace WebsiteBuilder
{
    public class SiteBuilder
    {
        private readonly JsonSerializer _json = new JsonSerializer();

        public void Build(string inputPath, string outputPath)
        {
            Directory.CreateDirectory(outputPath);

            DirectoryCopy(inputPath, outputPath, true);

            //CleanWordPressXml(Path.Combine(inputPath, "blogdata.xml"), "c:\\dev\\blog.xml");

            //var task = DownloadBlogImages(inputPath);
            //Task.WaitAll(task);
            CreateBlogPages(inputPath, outputPath);
        }

        private void CreateBlogPages(string inputPath, string outputPath)
        {
            using (var reader = XmlReader.Create(Path.Combine(inputPath, "blog.xml")))
            {
                reader.MoveToContent();

                // Loop through each element
                while (reader.Read())
                {
                    if (reader.NodeType == XmlNodeType.Element)
                    {
                        switch (reader.Name)
                        {
                            case "channel":
                                {
                                    using (var innerReader = reader.ReadSubtree())
                                    {
                                        CreateBlogPagesFromChannelNode(inputPath, outputPath, innerReader);
                                    }
                                    break;
                                }

                            default:
                                reader.Skip();
                                break;
                        }
                    }
                }
            }
        }

        private void CreateBlogPagesFromChannelNode(string inputPath, string outputPath, XmlReader reader)
        {
            reader.MoveToContent();

            // Loop through each element
            while (reader.Read())
            {
                if (reader.NodeType == XmlNodeType.Element)
                {
                    switch (reader.Name)
                    {
                        case "item":
                            {
                                using (var innerReader = reader.ReadSubtree())
                                {
                                    CreateBlogPageFromItem(inputPath, outputPath, innerReader);
                                }
                                break;
                            }

                        default:
                            reader.Skip();
                            break;
                    }
                }
            }
        }

        private void CreateBlogPageFromItem(string inputPath, string outputPath, XmlReader reader)
        {
            string title = null;
            string link = null;
            string pubDate = null;
            string description = null;
            string author = null;

            reader.MoveToContent();

            // Loop through each element
            while (reader.Read())
            {
                if (reader.NodeType == XmlNodeType.Element)
                {
                    switch (reader.Name)
                    {
                        case "title":
                            {
                                title = reader.ReadElementContentAsString();
                                break;
                            }

                        case "link":
                            {
                                link = reader.ReadElementContentAsString().TrimEnd('/');
                                link = Path.ChangeExtension(link, ".html");
                                break;
                            }

                        case "pubDate":
                            {
                                pubDate = reader.ReadElementContentAsString();
                                break;
                            }

                        case "description":
                            {
                                description = reader.ReadElementContentAsString();
                                break;
                            }

                        case "author":
                            {
                                author = reader.ReadElementContentAsString();
                                break;
                            }

                        default:
                            reader.Skip();
                            break;
                    }
                }
            }

            DateTime pubDateInstance;
            if (DateTime.TryParse(pubDate, out pubDateInstance))
            {
                pubDate = pubDateInstance.ToShortDateString();
            }

            var template = File.ReadAllText(Path.Combine(inputPath, "blogpost.html"));

            template = template.Replace("{{metaDescription}}", title);
            template = template.Replace("{{articleTitle}}", title);
            template = template.Replace("{{description}}", description);

            template = template.Replace("{{pubDate}}", pubDate);

            var filename = Path.GetFileName(link);

            File.WriteAllText(Path.Combine(outputPath, filename), template);
        }

        private static void DirectoryCopy(string sourceDirName, string destDirName, bool copySubDirs)
        {
            // Get the subdirectories for the specified directory.
            DirectoryInfo dir = new DirectoryInfo(sourceDirName);

            if (!dir.Exists)
            {
                throw new DirectoryNotFoundException(
                    "Source directory does not exist or could not be found: "
                    + sourceDirName);
            }

            DirectoryInfo[] dirs = dir.GetDirectories();
            // If the destination directory doesn't exist, create it.
            if (!Directory.Exists(destDirName))
            {
                Directory.CreateDirectory(destDirName);
            }

            // Get the files in the directory and copy them to the new location.
            FileInfo[] files = dir.GetFiles();
            foreach (FileInfo file in files)
            {
                string temppath = Path.Combine(destDirName, file.Name);
                file.CopyTo(temppath, false);
            }

            // If copying subdirectories, copy them and their contents to new location.
            if (copySubDirs)
            {
                foreach (DirectoryInfo subdir in dirs)
                {
                    if (string.Equals(subdir.Name, ".git", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    string temppath = Path.Combine(destDirName, subdir.Name);
                    DirectoryCopy(subdir.FullName, temppath, copySubDirs);
                }
            }
        }
    }
}
