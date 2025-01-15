import os
import tempfile

from finlecurator.curator import Generator


class TestSecrets:

    def test_credentials(self):
        from finlecurator.curator_secrets import SECRETS

        project_id = SECRETS.get("project_id")
        assert project_id.startswith("finle-")


class TestCurator:

    def test_curator(self):
        generator = Generator()
        html_content = generator.run()
        assert html_content.startswith("<!DOCTYPE html>\n")

    def test_curator_write_to_disk(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            assert len(os.listdir(tmp_dir)) == 0
            generator = Generator(output_directory=tmp_dir)
            html_path = generator.run()
            dir_contents = os.listdir(tmp_dir)
            assert len(dir_contents) == 1
            assert os.path.join(tmp_dir, dir_contents[0]) == html_path
