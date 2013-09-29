import sys
from docutils import nodes, core, io
from docutils.parsers.rst import Directive, directives
from docutils.parsers.rst.roles import set_classes
from docutils.utils.code_analyzer import Lexer, LexerError, NumberLines

#class Pseudent(BasePseudoSection):
#
#    node_class = nodes.sidebar
#
#    option_spec = BasePseudoSection.option_spec.copy()
#    option_spec['subtitle'] = directives.unchanged_required
#
#    def run(self):
#        if isinstance(self.state_machine.node, nodes.sidebar):
#            raise self.error('The "%s" directive may not be used within a '
#                             'sidebar element.' % self.name)
#        return BasePseudoSection.run(self)
#
##Register the new directive.
#directives.register_directive('pseudent', Pseudent)

##Class representing a CyCo user with certain permissions.
#class CyCoUser:
#    #Permission
#    can_swear = False
#    def set_can_swear(self, can_swear_in):
#      self.can_swear = ( can_swear_in == 'can_swear' )
#
##Create a new directive
#class Swear(Directive):
#
#    has_content = True
#
#    def run(self):
#        self.assert_has_content()
#        if cyco_user.can_swear:
#            target = ''.join(self.content.data)
#            text = '<p>FUCK ' + target.upper() + '</p>'
#        else:
#            text = '<p>You are not allowed to swear, fuckhead.</p>'
#        return [nodes.raw('', text, format='html')]
#
##Register the new directive.
#directives.register_directive('swear', Swear)
#
##Create a user.
#cyco_user = CyCoUser()
#
##Read user permisssions from PHP.
#can_swear = input()
#cyco_user.set_can_swear(can_swear)

#Read the content to translate.
data_in = ''
for line in sys.stdin:
    data_in += line

#Parse some content.
doc = core.publish_parts(data_in, writer_name='html')['html_body']
print (doc)