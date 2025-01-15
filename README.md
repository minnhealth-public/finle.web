# finle.web

Personal Financial Legal (FinLe) Python/Django App

# Release Disclaimer
This is free software released into the public domain.

IT IS RELEASED "AS IS" WITHOUT ANY WARRANTY WHATSOEVER, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING, BUT NOT
LIMITED TO, ANY WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE OR ANY WARRANTY THAT THE CONTENTS ARE
NON-INFRINGING ON ANY PATENT OR COPYRIGHT WORLDWIDE OR ARE ERROR-FREE.  IN NO RESPECT SHALL THE RELEASORS INCUR ANY
LIABILITY FOR ANY DAMAGES, INCLUDING, BUT NOT LIMITED TO, DIRECT, INDIRECT, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING
OUT OF, RESULTING FROM, OR ANY WAY CONNECTED TO THE USE OF THE SOFTWARE, WHETHER OR NOT BASED UPON WARRANTY, CONTRACT,
TORT, OR OTHERWISE; WHETHER OR NOT INJURY WAS SUSTAINED BY PERSONS OR PROPERTY OR OTHERWISE; AND WHETHER OR NOT LOSS
WAS SUSTAINED FROM, OR AROSE OUT OF, THE RESULTS OF USING THE SOFTWARE.

# Install Instructions

## Prerequisites
You will need to install a few applications locally if you want to do local testing or debugging.

### Source Code
Obviously, you'll need the source code for the project. Clone the git project into your local working directory by
navigating to your working directory and issuing a clone command:

`git clone git@github.com:minnhealth-public/finle.web.git`

### Python 3.11.x

This project is based on Python 3.11. You may install the latest version of Python 3.11.x from here:

https://www.python.org/downloads/release/python-3117/

It is recommended to install this for your user only and do _not_ add Python 3.11 to the system PATH variables since
the instance of Python for this project will be invoked from a virtual environment. This allows you to have multiple
versions of Python accessible on your machine without conflicts between versions or package collections.

### PyCharm (Recommended)
Some members of the development team use PyCharm as an IDE for projects. PyCharm has support
for Django and databases built-in. PyCharm is made by JetBrains, so if you are familiar with Android Studio PyCharm
may feel somewhat familiar. PyCharm development environment instructions are below.

## Development Option A: PyCharm Project Import
PyCharm makes installation of a project virtual environment easy, but note that it is not easy to utilize this
environment outside of PyCharm. It is safe to experiment with both PyCharm and non-PyCharm local virtual environments,
so feel free to try multiple installations and decide what works best for you!

## Development Option B: Virtualenv
If you're serious about local Python development and want to use your own IDE, then a local virtual environment is the
way to go. Navigate to your local project and run these commands from the project root. These commands are from
Windows PowerShell, but any command-line shell should do. Note that you will need your install path for Python 3.11
which may differ from what is shown here. There are a few steps to follow for first-time environment set up.

### Upgrade Pip
The first step is to update the local python pip package manager:

`C:\Users\<user>\AppData\Local\Programs\Python\Python311\python.exe -m pip install --upgrade pip`

### Create the Virtual Environment for Python 3.11
Create your local virtual environment with the built-in Python 3 `venv` tool, then activate it:

#### Windows
`C:\Users\<user>\AppData\Local\Programs\Python\Python311\python.exe -m venv ./finle-311`
PowerShell: `.\finle-311\Scripts\Activate.ps1`

#### Mac
`python -m venv ./finle-311`
Bash: `source ./finle-311/bin/activate`

Now that the virtual environment is activated you should see `(finle-311)` as a prefix to your shell prompt. The local
venv is pointing to your Python installation so you no longer need to use long paths to run the correct version of
Python. Running `python -V` from the venv prompt should report `Python 3.11.x` for the python version.

Install the required packages into the virtual environment via this command:

`pip install -r ./requirements.txt`

## Initialize the Database for First Use

If this is your first use of the Django server, initialize the database and run migrations. Navigate to the `webapp`
directory and run:

`python manage.py migrate`

Next, create an admin superuser and follow the command line prompts to enter data for this user:

`python manage.py createsuperuser`


## Run Pytests

Run the local pytest suite to make sure that the install completed properly. There are a few ways this can be done:

### PyCharm
You can check the pytest configuration directly from the PyCharm pytest run configuration.


### Locally

The pytest suite can be run directly from a local environment (virtual or otherwise) from the project root directory:

`python -m pytest -v --ds=webapp.settings --cov`

## Run the Webserver

### PyCharm

Start up the local web server via the PyCharm configuration by clicking the "run" button next to your run
configuration. Follow the prompts to view the web page.

### Local Environment

From your local activated virtual environment, navigate to the `webapp` directory and run:
`python manage.py collectstatic`
`python manage.py runserver 127.0.0.1:8000`

Note that you will need a PostgreSQL instance running with the standard 5432 port open for the Django server to
run properly.

## Access the Webserver

After the webserver has been launched as described above, you can access the frontend and backend endpoints:

### Django Backend

The django based API backend is available here: http://127.0.0.1:8000/

The django based admin pages are available here: http://127.0.0.1:8000/admin and logging in

As long as your local postgres instance is running with port 5432 exposed this should
work for you. Similarly, if you are on Mac or Linux you could add an entry into your `/etc/hosts` file.

#### PSYCOPG2 Tweak

If you get a `django.core.exceptions.ImproperlyConfigured` exception with the `Error loading psycopg module:
No module named psycopg` message, then run `pip install psycopg2-binary` inside the virtual environment per
[SaeX's SO post](https://stackoverflow.com/a/22423419).

### React Frontend

The react based frontend is avalable here: http://127.0.0.1:3000
