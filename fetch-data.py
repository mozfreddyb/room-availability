import datetime
from pytz import UTC
import requests
from ifb import get_busy_times

ROOMS = {
  'Kaffeeklatsch': 'ber201@mozilla.com',
  'Gretchenfrage': 'ber205@mozilla.com',
  'Zeitgeist': 'ber210@mozilla.com',
}
URL = 'https://mail.mozilla.com/home/{}?view=day&fmt=ifb&start=0d&end=24h'

# utility:

def timedelta_to_readable(s):
        hours, remainder = divmod(s, 3600)
        minutes, seconds = divmod(remainder, 60)
        if (hours < 3):
          if (hours > 0):
            readable = "{} hours and {} minutes".format(hours,minutes)
          else:
            readable = "{} minutes".format(minutes)
          if s > 0:
            return "in "+readable
          else:
            # not used, we only call this func for future meetings
            return readable +" ago"
        return ""




def get_overview():
  now = datetime.datetime.now(tz=UTC)  
  for room,addr in ROOMS.iteritems():
    for busy,nxt in get_room_status(addr):
      busytext = "busy" if busy else "free"
      nxttext = timedelta_to_readable((nxt-now).total_seconds())
      print "room {} is {}, next meeting {}".format(room, busytext, nxttext)



def get_room_status(addr):
  now = datetime.datetime.now(tz=UTC)
  r = requests.get(URL.format(addr)) #XXX replace with async :p
  for start,end in get_busy_times(r.content):
    currently_busy = False
    if (now-end).total_seconds() < 0:
      # this meeting has not ended yet!
      if (now-start).total_seconds() > 0:
        # this meeting is now
        currently_busy = True
      else:
        # this is in the future
        next_meeting = start
      yield (currently_busy, next_meeting)          
    else:
      # this meeting has already ended
      pass
    prev_s, prev_n = start, end

    


get_overview();


