import React from 'react';
import { render, screen } from '@testing-library/react';
import TodoCard from './TodoCard';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { TaskField } from '../../models/todo';

const todoMock = {
  "id": 2,
  "completed": false,
  "title": "Living with Dementia",
  "shortDescription": "Living with dementia presents unique challenges that can affect individuals and their caregivers both emotionally and practically. It often requires adapting to changes in memory, cognition, and daily functioning, necessitating patience, understanding, and support from loved ones. Maintaining a supportive environment, engaging in stimulating activities, and accessing appropriate care and resources can significantly enhance quality of life for those affected by dementia.",
  "fullDescription": "<p style='font-family:\"Open Sans\",sans-serif'>Living with dementia can present a myriad of challenges, not only for the individuals diagnosed with the condition but also for their families and caregivers. The progressive nature of dementia often leads to a gradual decline in cognitive function, memory loss, and changes in behavior, which can significantly impact daily life. Simple tasks that were once routine may become increasingly difficult to perform, leading to frustration and feelings of helplessness. Moreover, individuals with dementia may experience difficulty in communicating their needs effectively, further complicating caregiving responsibilities. As the condition advances, it may become necessary to provide round-the-clock care and supervision to ensure the safety and well-being of the individual.<br/>\n<br/>\r\nWho do you have taking care of you?</p>\n<p><input name=\"care-team\" required=\"required\" type=\"text\"/></p>\n<p>Despite the challenges posed by dementia, it's essential to focus on providing compassionate care and support to enhance the quality of life for those affected. Creating a supportive environment that promotes dignity, autonomy, and meaningful engagement can significantly improve the well-being of individuals with dementia. Tailoring activities to their interests and abilities, fostering social connections, and maintaining familiar routines can help alleviate feelings of confusion and agitation. Additionally, offering emotional support and reassurance can help individuals cope with the changes and uncertainties associated with dementia. By adopting a person-centered approach to care and embracing empathy and understanding, it is possible to foster a sense of purpose, belonging, and joy in the lives of those living with dementia.<br/>\n<br/>\n<textarea cols=\"40\" name=\"Another text input\" rows=\"3\"></textarea></p>",
  "topic": {
    "id": 1,
    "name": "General"
  },
  "relatedTerms": ([] as string[]),
  "relatedTags": ([] as string[]),
  "relatedResources": ([] as string[]),
  "taskFields": ([] as TaskField[])
};

const finishedTaskFieldsMock = [
  {
    "id": 12,
    "teamTaskFields": [
      {
        "id": 20,
        "value": "Test this is another thing hello b",
        "completedTimestamp": "2024-02-23T21:01:32.619093Z",
        "teamId": 40,
        "taskFieldId": 12,
        "userId": 3
      }
    ],
    "label": "Another text input",
    "description": "",
    "required": false,
    "type": "textarea",
    "task": 1
  }
]

describe('TodoCard', () => {
  test('renders todo title and description', () => {
    render(
      <BrowserRouter>
        <TodoCard todo={todoMock} />
      </BrowserRouter>
    );

    const titleElement = screen.getByText(todoMock.title);
    const descriptionElement = screen.getByText(todoMock.shortDescription);
    expect(titleElement).toBeInTheDocument();
    expect(descriptionElement).toBeInTheDocument();
  });
  test('renders "Completed" button for incomplete todo', () => {
    render(
      <BrowserRouter>
        <TodoCard todo={todoMock} />
      </BrowserRouter>
    );
    const finishButton = screen.getByText('Start');
    expect(finishButton).toBeInTheDocument();
  });

  test('renders "Completed" message for completed todo', () => {
    const completedTodoMock = { ...todoMock, status: { completedTimestamp: "hello" }, taskFields: finishedTaskFieldsMock };
    render(
      <BrowserRouter>
        <TodoCard todo={completedTodoMock} />
      </BrowserRouter>
    );

    const completedMessage = screen.getByText('Completed');
    expect(completedMessage).toBeInTheDocument();
  });
  test('renders "Completed" message for completed todo', () => {
    const completedTodoMock = { ...todoMock, status: { modifiedTimestamp: "hello" }, taskFields: finishedTaskFieldsMock };
    render(
      <BrowserRouter>
        <TodoCard todo={completedTodoMock} />
      </BrowserRouter>
    );

    const completedMessage = screen.getByText('Finish Now');
    expect(completedMessage).toBeInTheDocument();
  });



  test('renders "Share" button', () => {
    render(
      <BrowserRouter>
        <TodoCard todo={todoMock} />
      </BrowserRouter>
    );

    const shareButton = screen.getByText('Share');
    expect(shareButton).toBeInTheDocument();
  });
});
