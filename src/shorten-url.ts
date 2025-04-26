declare global {
  export namespace __NEXT_DATA__ {
    export namespace props {
      export namespace initialProps {
        export const csrfToken: string
      }
      export namespace pageProps {
        export namespace initialState {
          export namespace common {
            namespace User {
              export const id: string
              export const xToken: string
            }
            export const user: typeof User | null
          }
        }
      }
    }
  }
}

/**
 * 원하는 graphql 요청을 보냅니다.
 * @param queryName 요청 쿼리 이름입니다.
 * @param query 요청 쿼리입니다.
 * @param variables 요청할 때 매개변수를 작성합니다.
 */
async function request(queryName: string, query: string, variables: any): Promise<{ data: any }> {
  const {
    props: {
      initialProps: {
        csrfToken,
      },
      pageProps: {
        initialState: {
          common: {
            user,
          },
        },
      },
    },
  } = __NEXT_DATA__
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Csrf-Token': csrfToken,
  })
  if (user) headers.set('X-Token', user.xToken)
  return fetch('https://playentry.org/graphql/' + queryName, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: query.trim().replace(/(?<=\()\s*|\s*(?=\))|(?<={)\s*|\s*(?=})|\s*(?={)|(?<=\))\s*(?={)|(?<=:)\s*|(?<=,)\s*/g, '').replace(/\n\s*/g, ','), variables }),
  }).then(v => v.json())
}

/**
 * 스터디를 만듭니다.
 * @param id 작품의 id입니다.
 */
async function createLecture(id: string) {
  const { data } = await request('CREATE_LECTURE', `
    mutation CREATE_LECTURE(
      $title: String
      $categoryCode: String
      $description: String
      $goals: [String]
      $difficulty: Int
      $requiredTime: Int
      $studies: [JSON]
      $groupId: ID
      $isOpen: Boolean
    ) {
      createLecture(
        title: $title
        categoryCode: $categoryCode
        description: $description
        goals: $goals
        difficulty: $difficulty
        requiredTime: $requiredTime
        studies: $studies
        groupId: $groupId
        isOpen: $isOpen
      ) {
        status
        result
      }
    }
  `, {
    title: ' ',
    categoryCode: 'etc',
    description: ' ',
    goals: [' '],
    difficulty: 1,
    requiredTime: 1,
    studies: [
      {
        injectOption: {
          objectEditable: true,
          pictureeditable: true,
          soundeditable: true,
          dataTableEnable: false,
          sceneEditable: true,
          messageEnable: true,
          variableEnable: true,
          listEnable: true,
          functionEnable: true,
          programmingMode: 0,
        },
        doneProject: id,
        availableBlocks: [],
        hints: [],
      },
    ]
  })
  return data.createLecture.result.id
}

/**
 * 스터디의 작품을 불러옵니다.
 * @param id 스터디의 id입니다.
 */
async function getStudyProject(id: string) {
  const { data } = await request('SELECT_LECTURE', `
    query SELECT_LECTURE($id: ID!, $groupId: ID, $studentId: ID) {
      lecture(id: $id, groupId: $groupId, studentId: $studentId) {
        studies {
          doneProject {
            shortenUrl
          }
        }
      }
    }
  `, { id })
  return data.lecture.studies.map((project: { doneProject: any }) => project.doneProject)
}

/**
 * 스터디를 삭제합니다.
 * @param id 작품의 id입니다.
 */
async function deleteLecture(id: string) {
  const { data } = await request('DELETE_LECTURE', `
    mutation DELETE_LECTURE($id: ID!) {
      deleteLecture(id: $id) {
        status
        result
      }
    }
  `, { id })
  return data.deleteLecture.result
}

/**
 * 작품의 사본을 만들고, 그 사본의 링크를 얻습니다.
 * @param id 작품의 id입니다.
 * @param onChangeStep 진행 단계가 변경될 때 호줄됩니다.
 */
async function getShortenUrl(id: string, onChangeStep?: ChangeStopCallback) {
  const userId = __NEXT_DATA__.props.pageProps.initialState.common.user?.id
  if (!userId) {
    alert('로그인 후 사용 가능합니다.')
    throw new Error('not logged in')
  }

  const studyId: string = await createLecture(id)
  onChangeStep?.('study', studyId)

  const [ project ] = await getStudyProject(studyId)
  onChangeStep?.('project', project)

  deleteLecture(studyId)
  return project.shortenUrl
}

export interface ChangeStopCallback {
  (step: 'study', id: string): void
  (step: 'project', project: object): void
}

export default getShortenUrl
