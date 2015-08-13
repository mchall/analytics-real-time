Google Analytics Real-time Viewer
================================

View real-time analytics in a single page.
![Main](http://mchall.github.io/Images/AnalyticsViewer/AnalyticsViewer.png)

Add extra views to the '_posts' folder with the View ID (found in Google Analytics under Admin -> View -> View Settings) and descriptive name. 

### Building the site using Jekyll

If you're familiar with [Jekyll](http://jekyllrb.com) it can make running the demos locally or deploying them to a remote server much easier. It's actually how this repo is built and how the demo app is deployed.

```sh
# Clone the repo and cd into the repo directory.
git clone git@github.com:mchall/analytics-real-time.git
cd analytics-real-time

# Run the site locally using Jekyll
jekyll serve
```

The `jekyll serve` command will build all the files and load up a server on your local machine. Then you can go to [http://localhost:4000](http://localhost:4000) and everything should work fine. If you run `jekyll serve -w` it will also watch for changes to your source files and rebuild the site on the fly. This makes it easy to change a few things and see the results immediately.

If you need to change any of the configuration settings (like your client ID) you can set them in the [_config.yml](https://github.com/mchall/analytics-real-time/blob/master/_config.yml) file and rerun the `jekyll serve` command.
