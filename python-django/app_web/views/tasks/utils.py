from typing import Dict

from bs4 import BeautifulSoup

from app_web.models import (
    Task,
    TaskField,
)


def process_input_element(element, team_field):
    if element.name == "input" and element["type"] == "radio":
        if element["value"] == team_field.value:
            element["checked"] = "checked"
    elif element.name == "input" and element["type"] == "checkbox":
        if team_field.value in ["1", "on"]:
            element["checked"] = "checked"
    elif element.name == "input":
        element["value"] = team_field.value
    elif element.name == "select":

        sel_opts = element.find_all('option', attrs={'selected': 'selected'})
        # remove old selected value
        for opt in sel_opts:
            del opt['selected']

        values = team_field.value.split(",")

        for option in element.find_all("option"):
            if option["value"] in values:
                option["selected"] = "selected"
    else:
        element.append(team_field.value)


def is_task_complete(task):
    all_task_fields = task.taskfield_set.all()
    for field in all_task_fields:
        if field.required:
            team_fields = [
                team_task_field
                for task_field in all_task_fields
                for team_task_field in task_field.teamtaskfield_set.all()
            ]

            # Return false if there are no teamtaskfields yet, if there are fewer teamtaskfields than required, or
            # if any of the teamtaskfields are not completed.
            if not team_fields:
                return False
            if len(team_fields) < len(all_task_fields):
                return False
            for team_field in team_fields:
                if team_field.completed_timestamp is None:
                    return False
    return True


def get_description_for_team(task: Task):
    """task.taskfield_set should be prefetched for speed."""
    soup = BeautifulSoup(task.full_description, "html.parser")
    task_fields_dict: Dict[str, TaskField] = {task_field.id: task_field for task_field in task.taskfield_set.all()}

    # Extract all input elements
    input_elements = soup.find_all(["input", "textarea"])

    for input_elem in input_elements:
        if input_elem.get("type") == "checkbox":
            checkbox_name = input_elem.get("name")
            checkbox_id = input_elem.get("data-task-field-id")
            if checkbox_name:
                # Create hidden input for unchecked state
                hidden_input = soup.new_tag("input", type="hidden", attrs={"name": checkbox_name, "value": "off",
                                                                           "data-task-field-id": checkbox_id})
                # Insert hidden input before the checkbox
                input_elem.insert_before(hidden_input)

        # assign to temp var to be able to inject it easier
        temp_inp = input_elem
        task_field: TaskField = task_fields_dict.get(int(input_elem.get("data-task-field-id", -1)), None)
        if task_field is not None:
            team_field = next(reversed(task_field.teamfield), None)  # get first or None
            # few None checks
            if team_field is not None:
                process_input_element(temp_inp, team_field)

        label = soup.new_tag("label")

        contents = temp_inp.replace_with(label)
        label.append(contents)

    select_elements = soup.find_all(["select"])

    for select_elem in select_elements:
        temp_inp = select_elem
        task_field: TaskField = task_fields_dict.get(int(select_elem.get("data-task-field-id", -1)), None)
        if task_field is not None:
            team_field = next(reversed(task_field.teamfield), None)  # get first or None
            # few None checks
            if team_field is not None:
                process_input_element(temp_inp, team_field)

        label = soup.new_tag("label")

        contents = temp_inp.replace_with(label)
        label.append(contents)

    return str(soup)
