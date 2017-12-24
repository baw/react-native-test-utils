import React from 'react'
import renderer from './index'
import { Text, View, TextInput } from 'react-native'

const Comp = () => (
  <View>
    <Text>
      Welcome to React Native!
    </Text>
    <Text>
      To get started, edit index.ios.js
    </Text>
    <Text>
      Press Cmd+R to reload,{'\n'}
      Cmd+D or shake for dev menu
    </Text>
    <TextInput value='asdf' />
  </View>
)

describe('tagNames', () => {
  it('basic', () => {
    let view = renderer(<Comp />)

    let input = view.query('TextInput')
  })
})

describe('attributes', () => {
  it('attribute existance', () => {
    let view = renderer(<Comp />)

    let input = view.query('[value]')
    expect(input).not.toBeNull()
  })

  it('matches =', () => {
    let view = renderer(<Comp />)

    let input = view.query("[value='asdf']")
    expect(input).not.toBeNull()
  })

  it('matches |= where value is exact', () => {
    let view = renderer(<Comp />)

    let input = view.query("[value|='asdf']")
    expect(input).not.toBeNull()
  })

  it('matches |= where value is followed by -', () => {
    let view = renderer(<Text testID='asdf-fdsa'>Yo</Text>)

    let text = view.query("[testID|='asdf']")
    expect(text).not.toBeNull()
  })

  it('matches ^=', () => {
    let view = renderer(<Comp />)

    let input = view.query("[value^='as']")
    expect(input).not.toBeNull()
  })

  it('matches $=', () => {
    let view = renderer(<Comp />)

    let input = view.query("[value$='df']")
    expect(input).not.toBeNull()
  })

  it('matches *=', () => {
    let view = renderer(<Comp />)

    let input = view.query("[value*='sd']")
    expect(input).not.toBeNull()
  })

  it('can match multiple attributes', () => {
    let view = renderer(<Text a='asdf' b='fdsa'>Yo</Text>)

    let text = view.query("[a$='df'][b*='ds']")
    expect(text).not.toBeNull()
  })

  it('can match with a tagname', () => {
    let view = renderer(<Comp />)
    let input = view.query("TextInput[value='asdf']")
    expect(input).not.toBeNull()
  })
})

describe('id', () => {
  it('will match a testID', () => {
    let view = renderer(<Text testID='test'>Yo</Text>)
    let text = view.query('#test')
    expect(text).not.toBeNull()
  })

  it('ignores periods as classnames', () => {
    let view = renderer(<Text testID='a.b'>Yo</Text>)
    expect(view.query('#a.b')).not.toBeNull()
  })
})

describe('selectors', () => {
  it('matches multiple views with multiple selectors', () => {
    let view = renderer(
      <View>
        <Text testID='test'>Yo</Text>
        <TextInput />
      </View>
    )

    let views = view.queryAll('#test, TextInput')
    expect(views.length).toEqual(2)
  })
})

describe('simulate', () => {
  it('errors when you try to simulate on something that cant handle that event', () => {
    let onChange = jest.fn()
    let view = renderer(<TextInput onChange={onChange} />)
    expect(() => {
      view.simulate('changeText', 'asdf')
    }).toThrow()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('doesnt error and calls the handler', () => {
    let onChangeText = jest.fn()
    let view = renderer(<TextInput onChangeText={onChangeText} />)
    expect(() => {
      view.simulate('changeText', 'asdf')
    }).not.toThrow()
    expect(onChangeText).toHaveBeenCalledWith('asdf')
  })
})

describe('text', () => {
  it('finds all the text rendered by a component and its subviews', () => {
    let view = renderer(
      <View>
        <Text>H</Text>
        <Text>e</Text>
        <Text>l</Text>
        <Text>l</Text>
        <View>
          <Text>o</Text>
        </View>
      </View>
    )
    expect(view.text()).toEqual('Hello')
  })
})

const Child = ({ text }) => (
  <Text>
    Child { text }
  </Text>
)

const Parent = () => (
  <View>
    <Text>
      Parent-4
    </Text>
    <Text>
      Parent-5
    </Text>
    <Child text="1" />
    <Child text="2" />
    <Child text="3" />
  </View>
)

const expectTextToNotInclude = (text, strings) => {
  strings.beforeEach((str) => {
    expect(text).not.toEqual(
      expect.stringContaining(str)
    )
  })
}

const getTextFromComponents = (components) => {
  return components.reduce((allText, component) => {
    allText += component.text()
    return allText
  }, "")
}

describe('child querying', () => {
  let rendered;
  beforeEach(() => {
    rendered = renderer(<Parent />)
  })

  describe('using ">"', () => {
    describe('using query', () => {
      let component;
      beforeEach(() => {
        component = rendered.query('Parent > Text')
      })
      it('should find a component', () => {
        expect(component).not.toBeNull()
      })

      it('should be a "Text" component', () => {
        expect(component.toJSON().type).toBe("Text")
      })

      it('should only find a component that are a direct child of parent', () => {
        const text = component.text().toLowerCase()
        expect(text).toEqual(
          expect.stringContaining("parent")
        )
        expect(text).not.toEqual(
          expect.stringContaining("1"),
          expect.stringContaining("2"),
          expect.stringContaining("3")
        )
      })

      it('should only find the first component', () => {
        const text = component.text()
        expect(text.toLowerCase()).toEqual(
          expect.stringContaining("4")
        )
        expect(text).not.toEqual(
          expect.stringContaining("5"),
          expect.stringContaining("1"),
          expect.stringContaining("2"),
          expect.stringContaining("3")
        )
      })
    })

    describe('using queryAll', () => {
      let components;
      let text;
      beforeEach(() => {
        components = rendered.queryAll('Parent > Text')
        text = getTextFromComponents(components)
      })

      it('should find a component', () => {
        expect(components.length).not.toBe(0)
      })

      it('should only find a component that are a direct child of parent', () => {
        expect(text.toLowerCase()).toEqual(
          expect.stringContaining('parent')
        )

        expectTextToNotInclude(text, ['1', '2', '3'])
      })

      it('should find all components', () => {
        expect(text).toEqual(
          expect.stringContaining('4'),
          expect.stringContaining('5')
        )
        expectTextToNotInclude(text, ['1', '2', '3'])
      })
    })
  })

  describe('using decendant selector', () => {
    describe('using query', () => {
      let component
      let text
      beforeEach(() => {
        component = rendered.query('Parent Text')
        text = component.text()
      })
      it('should find a component', () => {
        expect(component).not.toBeNull()
      })

      it('should only find a component that are a child of parent', () => {
        expect(text).toEqual(
          expect.stringContaining('4'),
          expect.stringContaining('5'),
          expect.stringContaining('1'),
          expect.stringContaining('2'),
          expect.stringContaining('3')
        )
      })

      it('should only find the first component', () => {
        expect(text).toEqual(
          expect.stringContaining('4')
        )
        expect(text).not.toEqual(
          expect.stringContaining(/[1-3]|5/)
        )
      })
    })

    describe('using queryAll', () => {
      let components
      let text
      beforeEach(() => {
        components = rendered.queryAll('Parent Text')
        text = getTextFromComponents(components)
      })
      it('should find a component', () => {
        expect(components).not.toBeNull()
        expect(components.length).not.toBe(0)
      })

      it('should only find components that are a child of parent', () => {
        components.beforeEach((component) => {
          const text = component.text()
          expect(text).toMatch(/[1-5]/)
        })
      })

      it('should find all components', () => {
        expect(components.length).toBe(5)
      })
    })
  })
})
