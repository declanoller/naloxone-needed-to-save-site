
# Naloxone needed to save website

www.naloxoneneededtosave.org


## Notes

* You can open index.html locally in your browser; however, if I recall correctly, without a server running, it won't load the .json files correctly. But (I think) you can locally start a server with python on the command line, and then it'll work.
* The two .py files in `misc/` can be used to translate the output from the model to json in the format that d3 will use.


## To do

* Non-model states have a plot for Deaths averted vs THN distributed, but not for RX or SO kits distributed
* Quick stats for non-model states are all 0's
* The drop-down state selector is the only element that doesn't resize with the window
* Change labels
* Add resources at top
* Add HTTPS to server, so it doesn't give the warning sign in the browser when you go to it
* Possibly upgrade server to handle more traffic
