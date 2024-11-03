const { format, createLogger, transports } = require("winston");
const { combine, timestamp, label, printf, prettyPrint } = format;
const CATEGORY = "Event Management Website";

const logger = createLogger({
    level: "debug",
    format: combine(
        label({ label: CATEGORY }),
        timestamp({
            format: "MMM-DD-YYYY HH:mm:ss",
        }),
        prettyPrint()
    ),
    transports: [
        //new transports:
        new transports.File({
            filename: "logs/Alltimelogs.log",
        }),
    ],
});

module.exports = logger;