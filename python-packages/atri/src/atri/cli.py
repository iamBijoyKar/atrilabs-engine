"""This script is the entrypoint for command line utilities provided in Atri Framework."""
import click

@click.group()
def main():
    """Open up the visual editor:

        $ atri open editor

    Click publish in the editor once you are done.

    Write your python controllers in controller directory.

    Run dev server during development for automatic refresh whenever you make changes to your code or hit publish in your editor.

        $ atri run dev-server
    
    """
    pass

@main.group('open')
def open():
    """Open up editor in browser using command:

        $ atri open editor
    """
    pass

@open.command('editor')
@click.option('--eport', default=4001, help='port on which event server will be attached')
@click.option('--wport', default=4002, help='port on which file server will be attached to serve static files')
@click.option('--atri-dir', default='atri', help='directory that contains events/')
@click.option('--generated', default='generated', help='directory that contains generated web app code')
def open_editor(eport, wport, atri_dir):
    """Open up editor in browser using command -

        $ atri open editor --port 4000
    """
    print(eport, wport, atri_dir)

@main.group('run')
@click.option('--controllers', default='controllers', help='directory that contains controller scripts')
def run():
    """Run dev server during development for automatic refresh whenever you make changes to your code or hit publish in your editor.

        $ atri run dev-server
    """
    pass

@run.command('dev-server')
def dev_server():
    """Run dev server during development for automatic refresh whenever you make changes to your code or hit publish in your editor.

        $ atri run dev-server
    """
    pass

@main.group('package')
def package():
    """Package your app in a docker image:

        $ atri package docker
    """
    pass

@package.command('docker')
def package_as_docker():
    """Package your app in a docker image:

        $ atri package docker
    """
    pass