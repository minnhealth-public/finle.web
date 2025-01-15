import os
from attr import attrib, attrs
from logging import Logger
from pytz import timezone

from finlecurator.models.model import Source
from finlecurator.data.gsheets_analyzer import GSheetsAnalyzer
from finlecurator.data.database_analyzer import DBAnalyzer
from finlecurator.reporting.report import Report

DEFAULT_REPORT_FILENAME = "finle_video_curation_report.html"

LOGGER = Logger(__name__)


@attrs
class Generator:
    output_directory: str = attrib(default=None)

    def __attrs_post_init__(self):
        if self.output_directory is not None and not os.path.isdir(self.output_directory):
            raise FileNotFoundError(f"Output directory does not exist: {self.output_directory}")

    def run(self, report_filename: str = DEFAULT_REPORT_FILENAME, refresh: bool = False,
            source: int = Source.GSHEETS.value, csrftoken: str = '') -> str:
        """
        Generates the video curator report by writing a file to disk or returning HTML.

        :param report_filename: Optional report file name to use when rendering the report
        :param refresh: True to force a refresh of the spreadsheet data
        :param source: Specifies whether pulling from Google Sheets (1) or Database (2)
        :param csrftoken: The middleware token for authenticating calls

        :returns: Path to HTML file on disk or an HTML report
        """
        rtn = ""
        analyzer = None
        source_int = int(source)
        if source_int == Source.GSHEETS.value:
            analyzer = GSheetsAnalyzer()
        elif source_int == Source.DATABASE.value:
            analyzer = DBAnalyzer()
        success, error_message = analyzer.fetch_video_data(refresh)
        if success:
            channels = analyzer.analyze_video_data()
            if channels is not None:
                timestamp = analyzer.get_report_time(analyzer.PICKLE_FILE, timezone("US/Central"))
                report = Report(channels, timestamp, include_form=True, only_body_content=False)
                html = report.create_video_report(csrftoken)

                if self.output_directory is not None:
                    report_path = os.path.join(self.output_directory, report_filename)
                    with open(report_path, "wt") as f:
                        f.write(html)
                        LOGGER.info(f"Video curator report written to disk: {report_path}")
                    rtn = report_path
                else:
                    rtn = html

        return rtn
