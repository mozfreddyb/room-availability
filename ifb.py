""" implement internet free/busy vcal extension

  very basic just to get something like this running:

BEGIN:VCALENDAR
PRODID:Zimbra-Calendar-Provider
VERSION:2.0
METHOD:PUBLISH
BEGIN:VFREEBUSY
ORGANIZER:mailto:ber201@mozilla.com
DTSTAMP:20140811T130952Z
DTSTART:20140811T130952Z
DTEND:20140812T130952Z
URL:http://zmmbox6.mail.corp.phx1.mozilla.com:8080/service/home/ber201@mozilla.com?view=day&date=20140811&fmt=ifb&start=0d&end=24h
FREEBUSY;FBTYPE=BUSY:20140812T100000Z/20140812T103000Z
END:VFREEBUSY
END:VCALENDAR



"""


from dateutil import parser
# all calculations in UTC.

def get_busy_times(s):
  lines = s.split("\r\n")
  for line in lines:
    if line == "":
      continue
    key,value = line.split(":", 1)
    if key == "FREEBUSY;FBTYPE=BUSY":
      start,end = value.split("/")
      start = parser.parse(start)
      end = parser.parse(end)
      yield (start,end)