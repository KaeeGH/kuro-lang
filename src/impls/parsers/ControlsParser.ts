import { Parser, Expression } from '../..'
import { injectParser } from './parserContainer'
import { ParserToken, IfExpression, BlockStatement } from '../../types'
import { IParser } from '../../interfaces'
import { TokenWalker } from '../../classes'
import { injectable } from 'inversify'

/**
 * ControlsParser class.
 */
@injectable()
export class ControlsParser extends Parser<Expression> {
  /**
   * BlockParser.
   */
  @injectParser(ParserToken.Block) block: IParser<BlockStatement>

  /**
   * ExpressionsParser.
   */
  @injectParser(ParserToken.Expressions) expressions: IParser<Expression>

  /**
   * AtomParser.
   */
  @injectParser(ParserToken.Atom) atom: IParser<Expression>

  parse(walker: TokenWalker): Expression {
    const peek = walker.peek()

    if (!peek) {
      throw this.createPeekError(walker)
    }

    if (peek.kind === 'if') {
      return this.parseIf(walker)
    }

    return this.atom.parse(walker)
  }

  /**
   * Parse if expression.
   *
   * @param walker Token walker.
   */
  protected parseIf(walker: TokenWalker): IfExpression {
    const ifToken = walker.next()

    if (!ifToken) {
      throw this.createPeekError(walker)
    }

    if (ifToken.kind !== 'if') {
      throw this.createUnexpectedError(ifToken, walker, 'if')
    }

    const condition = this.expressions.parse(walker)
    const thenStatement = this.block.parse(walker)

    let peek = walker.peek()

    if (peek && peek.kind === 'else') {
      walker.next()
      peek = walker.peek()
      let elseStatement: IfExpression['else']

      if (peek && peek.kind === 'if') {
        elseStatement = this.parseIf(walker)
      } else {
        elseStatement = this.block.parse(walker)
      }

      return {
        kind: 'if_expression',
        condition,
        then: thenStatement,
        else: elseStatement,
        loc: ifToken.loc.merge(elseStatement.loc),
      }
    }

    return {
      kind: 'if_expression',
      condition,
      then: thenStatement,
      loc: ifToken.loc.merge(thenStatement.loc),
    }
  }
}
