# pretty-kitty
Starcats LED signage

## Hardware

There are two signs. Each consists of a 60 wide by 8 high LED matrix, 1 meter in each direction. Each sign contains a Raspberry Pi and a Fadecandy controller board. The Fadecandy is attached to the Pi via USB. The Fadecandy's special trick is temporal dithering for better (gamma-corrected) colors, but you can ignore that if you don't know what that means (or if you're curious you can probably still google Fadecandy and learn about it.) The Pi's role is to receive pixel data over the network and send it over USB to the Fadecandy.

This was state of the art when I made the signs in 2019. Fadecandy isn't made anymore (writing this in 2026) so if a Fadecandy board breaks you should just replace it with a modern LED controller (in which case you probably wouldn't need the Pi.) If you want to still have gamma correction, which I always recommend, then get gamma corrected LEDs like we used in Dragon Egg. If you did that you could also add more LEDs, since the reason there are only 8 rows was Fadecandy hardware limitations, but at that point you might as well make a whole new sign.

## Usage

If all goes well, the signs should boot into E131 receiver mode when given power. (Note that you must plug them in to power AND also turn the power switch on, which is next to the power plug.) They should then automatically get a DHCP address from your router. You can find their IP addresses either of two ways:
- If you have a laptop with mDNS support (which is most things these days), get on the same network as them, and ping `pretty-kitty.local` and `pretty-kitty-2.local` and see what IP is used.
- If you have access to the router, look at the DHCP table and see what addresses they were assigned.

Then use your favorite LED software to send pixel data over E131 to their IPs. Each sign is mapped continuously from the beginning of universe 0, in other words (top to bottom):
- Strip 0: 60 pixels starting at universe 0 offset 0
- Strip 1: 60 pixels starting at universe 0 offset 180
- Strip 2: 60 pixels starting at universe 0 offset 360
- Strip 3: 60 pixels starting at universe 1 offset 30
- Strip 4: 60 pixels starting at universe 1 offset 210
- Strip 5: 60 pixels starting at universe 1 offset 390
- Strip 6: 60 pixels starting at universe 2 offset 60
- Strip 7: 60 pixels starting at universe 2 offset 240

In some software you may need to add 1 to all of the universe numbers. Also, for strips that cross universe boundaries (strips 2 and 5 above), the last 2 channels at the end of the universe are not used so that each LED is entirely within one universe. In other words, universes are treated ashaving only 510 channels. This is what software like LX/Chromatik expects so entering the values above should work in Chromatik.

If a sign does not receive any E131 data for 5 seconds then it will set all pixels to white as a safety measure so that art cars don't crash into the cats. When E131 data resumes again the sign will go back to normal operation. This will only trigger if no data is received. If your software continuously sends the sign all 0's then it will stay dark, which is a significant safety hazard on the Esplanade so be careful.

## Logging in

If everything's working there is no need to log into the signs, but if you do want to:

`ssh starcats@pretty-kitty.local` (or `pretty-kitty-2.local`)
Password `starcats`

Disregard the wifi information printed on back of one of the signs. It might still work but no guarantees. (This was how we logged into them originally, when they didn't have ethernet ports and only one sign had a Pi in it, and that sign connected to the other sign with a long USB cable.. that history will also explain the various quirks in how they're built, like the unused USB port.)

## Troubeshooting

In the past, one of the signs (`pretty-kitty-2`) sometimes didn't work, I'm guessing due to a startup race condition with the Fadecandy daemon starting before the USB system is ready, or maybe with our software starting before the Fadecandy daemon was ready. If this happens, power cycling it can fix it (a couple times, until you get lucky and it works.) Once it works it's fine and continues working until it's powered off. Hopefully this is fixed now but if you have problems it's worth trying.

## Running the old rainbow pattern

The original rainbow pattern is a starcats classic and actually looks pretty nice despite being just a rainbow fade.

To run it, log in, kill the node process running e131-relay.js and anything restarting it, and then run `node main.js` instead (or run it with nodemon or something else that will keep it running/restart it.)

## Reinstalling on a new Pi

If a Pi dies and you want to replace it, here's what I think you need to do (not tested, but it's not super complicated):

Check out this repo onto the new Pi in some directory. (I used `/home/starcats/co/pretty-kitty` per my personal convention for git checkouts; if you pick something else adjust the paths below.)

Run `tar xzvf fcserver-1.02.tar.gz`

If you changed the path, edit `startup-root.sh` and `startup.sh`.

Add the following to the end of `/etc/rc.local`:
```
su -c /home/starcats/co/pretty-kitty/startup-root.sh
su starcats -c /home/starcats/co/pretty-kitty/startup.sh
```

If no pixel data appears when you send E131 data, edit `e131-relay.js` and change `opcPixelOffset` from `0` to `numPixels`. (One sign needs this to be 0 and the other needs it to be `opcPixelOffset`, and which is which depends on the serial number of the Fadecandy board. I don't want to take playa time to fix this but you could if you really cared, or you could just change the value in the sign that doesn't show your data and call it a day.) For what it's worth, the sign with Fadecandy serial number FXAUNHWSXFCUQSNP, that does NOT have a sticker with wifi/ssh information on the back, is the one that should have `0`; and the other one with the wifi/ssh sticker, and Fadecandy serial number UEKDMEUYIGFAGIXF, should have `numPixels`.
